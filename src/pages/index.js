import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import RuleEditor from '../components/RuleEditor';
import RuleWizard from '../components/RuleWizard';
import VisualRuleBuilder from '../components/VisualRuleBuilder';
import ContextualSuggestions from '../components/ContextualSuggestions';
import TemplatesGallery from '../components/TemplatesGallery';
import ValidationToast from '../components/ValidationToast';
import InlineSuggestions from '../components/InlineSuggestions';
import RuleFixModal from '../components/RuleFixModal';
import LanguageSelector from '../components/LanguageSelector';
import AccessibilityPanel from '../components/AccessibilityPanel';
import Logo from '../components/Logo';
import { autoFixRule } from '../utils/ruleFixerUtils';
import { saveRule, getAllRules, getRuleById, deleteRule, revertToVersion } from '../utils/ruleStorage';
import { t } from '../utils/translations';

export default function Home() {
  const [apiKey, setApiKey] = useState('');
  const [naturalLanguageRule, setNaturalLanguageRule] = useState('');
  const [generatedRule, setGeneratedRule] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [savedRules, setSavedRules] = useState([]);
  const [currentRule, setCurrentRule] = useState(null);
  const [ruleName, setRuleName] = useState('');
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showWizard, setShowWizard] = useState(false);
  const [showVisualBuilder, setShowVisualBuilder] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [creationMode, setCreationMode] = useState('direct'); // 'direct', 'wizard', or 'visual'
  const [suggestionsEnabled, setSuggestionsEnabled] = useState(true);
  const [realtimeTranslationEnabled, setRealtimeTranslationEnabled] = useState(true);
  const [showValidationToast, setShowValidationToast] = useState(false);
  const [inlineSuggestionsEnabled, setInlineSuggestionsEnabled] = useState(true);
  const [showFixModal, setShowFixModal] = useState(false);
  const [fixResult, setFixResult] = useState(null);
  const [language, setLanguage] = useState('en'); // Default language is English
  const [textSize, setTextSize] = useState('medium');
  const textareaRef = useRef(null);
  const translationTimeout = useRef(null);
  
  // Load saved user preferences on initial render
  useEffect(() => {
    const savedLanguage = localStorage.getItem('ruleweave-language');
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Load saved rules on initial render
  useEffect(() => {
    setSavedRules(getAllRules());
  }, []);
  
  // Handle real-time translation when natural language rule changes
  useEffect(() => {
    if (naturalLanguageRule && apiKey && realtimeTranslationEnabled && creationMode === 'direct') {
      handleRealtimeTranslate(naturalLanguageRule);
    }
    
    return () => {
      if (translationTimeout.current) {
        clearTimeout(translationTimeout.current);
      }
    };
  }, [naturalLanguageRule, apiKey, realtimeTranslationEnabled, creationMode]);

  // Handle translating natural language to rule code
  const handleTranslate = async () => {
    if (!naturalLanguageRule) {
      setErrorMessage('Please enter a rule description');
      return;
    }

    if (!apiKey) {
      setErrorMessage('Please enter your Claude API key');
      return;
    }

    setErrorMessage('');
    setIsTranslating(true);
    
    try {
      const response = await axios.post('/api/translate', {
        naturalLanguageRule,
        apiKey
      });
      
      if (response.data && response.data.rule) {
        setGeneratedRule(response.data.rule);
      } else {
        setErrorMessage('Failed to generate rule');
      }
    } catch (error) {
      console.error('Translation error:', error);
      setErrorMessage(error.response?.data?.error || 'Error translating rule');
    } finally {
      setIsTranslating(false);
    }
  };

  // Handle validating the rule code
  const handleValidate = async () => {
    if (!generatedRule) {
      setErrorMessage('No rule to validate');
      return;
    }

    if (!apiKey) {
      setErrorMessage('Please enter your Claude API key');
      return;
    }

    setErrorMessage('');
    setIsValidating(true);
    
    try {
      const response = await axios.post('/api/validate', {
        ruleCode: generatedRule,
        apiKey
      });
      
      setValidationResult(response.data);
      setShowValidationToast(true);
    } catch (error) {
      console.error('Validation error:', error);
      setErrorMessage(error.response?.data?.error || 'Error validating rule');
    } finally {
      setIsValidating(false);
    }
  };

  // Handle rule generated from wizard
  const handleWizardRuleGenerated = (ruleCode, naturalLanguage) => {
    setGeneratedRule(ruleCode);
    setNaturalLanguageRule(naturalLanguage);
    setShowWizard(false);
    setCreationMode('direct');
    setValidationResult(null);
  };
  
  // Handle rule generated from visual builder
  const handleVisualRuleGenerated = (ruleCode, naturalLanguage) => {
    setGeneratedRule(ruleCode);
    setNaturalLanguageRule(naturalLanguage);
    setValidationResult(null);
  };
  
  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const cursorPos = textarea.selectionStart;
    const textBefore = naturalLanguageRule.substring(0, cursorPos);
    const textAfter = naturalLanguageRule.substring(cursorPos);
    
    // Insert the suggestion at the cursor position
    const newText = `${textBefore}${suggestion.text} ${textAfter}`;
    setNaturalLanguageRule(newText);
    
    // Focus the textarea and set cursor position after the inserted suggestion
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = cursorPos + suggestion.text.length + 1; // +1 for the space
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Toggle suggestions on/off
  const toggleSuggestions = () => {
    setSuggestionsEnabled(!suggestionsEnabled);
  };

  // Toggle real-time translation on/off
  const toggleRealtimeTranslation = () => {
    setRealtimeTranslationEnabled(!realtimeTranslationEnabled);
  };
  
  // Toggle inline suggestions on/off
  const toggleInlineSuggestions = () => {
    setInlineSuggestionsEnabled(!inlineSuggestionsEnabled);
  };
  
  // Handle inline suggestion acceptance
  const handleAcceptInlineSuggestion = (suggestion) => {
    setNaturalLanguageRule(naturalLanguageRule + suggestion);
  };
  
  // Handle auto-fix of rule
  const handleFixRule = () => {
    if (!generatedRule || !validationResult) return;
    
    const result = autoFixRule(generatedRule, validationResult.errors);
    setFixResult(result);
    setShowFixModal(true);
  };
  
  // Apply fix to the rule
  const handleApplyFix = (fixedRule) => {
    setGeneratedRule(fixedRule);
    setShowFixModal(false);
    
    // Re-validate the fixed rule
    setTimeout(() => {
      handleValidate();
    }, 500);
  };
  
  // Handle real-time translation
  const handleRealtimeTranslate = async (text) => {
    if (!text || !apiKey || !realtimeTranslationEnabled) {
      return;
    }
    
    // Clear any pending translation request
    if (translationTimeout.current) {
      clearTimeout(translationTimeout.current);
    }
    
    // Debounce the translation request to avoid API overuse
    translationTimeout.current = setTimeout(async () => {
      // Only translate if text has enough content to work with
      if (text.length < 10) {
        return;
      }
      
      setIsTranslating(true);
      
      try {
        const response = await axios.post('/api/translate', {
          naturalLanguageRule: text,
          apiKey,
          realtime: true  // Flag this as a real-time request
        });
        
        if (response.data && response.data.rule) {
          setGeneratedRule(response.data.rule);
        }
      } catch (error) {
        console.error('Real-time translation error:', error);
        // Don't show error messages for real-time translations
      } finally {
        setIsTranslating(false);
      }
    }, 800); // 800ms debounce
  };

  // Handle saving the current rule
  const handleSaveRule = () => {
    if (!generatedRule) {
      setErrorMessage('No rule to save');
      return;
    }

    if (!ruleName) {
      setErrorMessage('Please enter a name for this rule');
      return;
    }

    setErrorMessage('');
    
    try {
      const ruleToSave = {
        id: currentRule?.id,
        name: ruleName,
        naturalLanguage: naturalLanguageRule,
        ruleCode: generatedRule,
        versions: currentRule?.versions || [],
      };
      
      const savedRuleResult = saveRule(ruleToSave);
      setCurrentRule(savedRuleResult);
      
      // Refresh the list of saved rules
      setSavedRules(getAllRules());
    } catch (error) {
      console.error('Error saving rule:', error);
      setErrorMessage('Failed to save rule');
    }
  };

  // Handle loading a saved rule
  const handleLoadRule = (ruleId) => {
    const rule = getRuleById(ruleId);
    if (rule) {
      setCurrentRule(rule);
      setRuleName(rule.name);
      setNaturalLanguageRule(rule.naturalLanguage);
      setGeneratedRule(rule.ruleCode);
      setValidationResult(null);
      setCreationMode('direct');
      setShowWizard(false);
      setShowVisualBuilder(false);
    }
  };

  // Handle deleting a rule
  const handleDeleteRule = (ruleId) => {
    if (window.confirm('Are you sure you want to delete this rule?')) {
      deleteRule(ruleId);
      
      // Refresh the list of saved rules
      setSavedRules(getAllRules());
      
      // If the current rule was deleted, clear the current rule
      if (currentRule && currentRule.id === ruleId) {
        setCurrentRule(null);
        setRuleName('');
        setNaturalLanguageRule('');
        setGeneratedRule('');
        setValidationResult(null);
      }
    }
  };

  // Handle reverting to a previous version
  const handleRevertToVersion = (versionIndex) => {
    if (!currentRule) return;
    
    if (window.confirm('Are you sure you want to revert to this version?')) {
      const revertedRule = revertToVersion(currentRule.id, versionIndex);
      
      if (revertedRule) {
        setCurrentRule(revertedRule);
        setGeneratedRule(revertedRule.ruleCode);
        
        // Refresh the list of saved rules
        setSavedRules(getAllRules());
      }
    }
  };

  // Reset the form for a new rule
  const handleNewRule = () => {
    setCurrentRule(null);
    setRuleName('');
    setNaturalLanguageRule('');
    setGeneratedRule('');
    setValidationResult(null);
    setShowVersionHistory(false);
    setCreationMode('direct');
    setShowWizard(false);
    setShowVisualBuilder(false);
  };

  // Start wizard flow
  const handleStartWizard = () => {
    setCreationMode('wizard');
    setShowWizard(true);
    setShowVisualBuilder(false);
  };
  
  // Start visual builder flow
  const handleStartVisualBuilder = () => {
    setCreationMode('visual');
    setShowVisualBuilder(true);
    setShowWizard(false);
    setShowTemplates(false);
  };
  
  // Open templates gallery
  const handleOpenTemplates = () => {
    setShowTemplates(true);
  };
  
  // Handle template selection
  const handleSelectTemplate = (template) => {
    if (template) {
      setRuleName(template.name);
      setNaturalLanguageRule(template.naturalLanguage);
      setGeneratedRule(template.ruleCode);
      setValidationResult(null);
    }
    setShowTemplates(false);
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-brand-teal-light/5" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%230B9E8E\' fill-opacity=\'0.05\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/svg%3E")' }}>
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        {/* Templates Gallery Modal */}
        {showTemplates && (
          <TemplatesGallery
            onSelectTemplate={handleSelectTemplate}
            onClose={() => setShowTemplates(false)}
          />
        )}
        
        {/* Main content ID for skip link target */}
        <div id="main-content">
        
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center">
              <Logo className="transform hover:scale-105 transition-transform duration-300" />
              <span className="ml-3 px-2.5 py-0.5 bg-gradient-to-r from-brand-coral-light/20 to-brand-coral/30 text-brand-coral-dark text-xs rounded-full font-medium border border-brand-coral-light/20">{t(language, 'general.beta')}</span>
            </div>
            <p className="text-brand-charcoal-light text-sm mt-1 font-medium pl-1">{t(language, 'general.tagline')}</p>
          </div>
          
          <div className="hidden md:flex items-center space-x-5">
            {/* Language Selector */}
            <LanguageSelector 
              selectedLanguage={language}
              onLanguageChange={(lang) => {
                setLanguage(lang);
                localStorage.setItem('ruleweave-language', lang);
              }}
            />
            
            {/* Accessibility Panel */}
            <AccessibilityPanel 
              language={language}
              onTextSizeChange={setTextSize}
            />
            
            <a href="https://github.com/gabrielrojasnyc/RuleWeave" 
               target="_blank" 
               rel="noopener noreferrer"
               className="text-slate-500 hover:text-indigo-600 flex items-center text-sm font-medium transition-colors duration-200"
               aria-label="GitHub Repository"
            >
              <svg className="w-5 h-5 mr-1.5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.163 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.934.359.31.678.92.678 1.852 0 1.337-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.16 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              GitHub
            </a>
            <a href="#" 
               className="text-slate-500 hover:text-indigo-600 flex items-center text-sm font-medium transition-colors duration-200"
               aria-label="Help"
            >
              <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Help
            </a>
          </div>
        </header>
        
        {/* API Key Input */}
        <div className="mb-6 card card-hover animate-fade-in">
          <div className="flex items-center px-5 py-4">
            <div className="mr-4 flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-teal-light/30 to-brand-teal/20 flex items-center justify-center" aria-hidden="true">
                <svg className="w-5 h-5 text-brand-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
                </svg>
              </div>
            </div>
            <div className="flex-grow">
              <label htmlFor="apiKey" className="block text-sm font-medium text-brand-charcoal mb-1">
                {t(language, 'apiKey.label')}
              </label>
              <div className="flex items-center">
                <input
                  type="password"
                  id="apiKey"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={t(language, 'apiKey.placeholder')}
                  className="flex-1 px-3 py-2.5 border border-neutral-300 rounded-lg shadow-sm focus-ring text-sm bg-white/80"
                  aria-required="true"
                  autoComplete="off"
                />
                {apiKey ? (
                  <div className="ml-3 flex-shrink-0 text-brand-teal flex items-center text-xs font-medium" aria-live="polite">
                    <div className="bg-brand-teal-light/20 p-1 rounded-full mr-1.5" aria-hidden="true">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                    {t(language, 'apiKey.set')}
                  </div>
                ) : (
                  <div className="ml-3 flex-shrink-0 text-brand-coral flex items-center text-xs font-medium" aria-live="polite">
                    <div className="bg-brand-coral-light/20 p-1 rounded-full mr-1.5" aria-hidden="true">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                      </svg>
                    </div>
                    {t(language, 'apiKey.required')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Editor Mode Tabs */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="tablist" aria-label="Rule creation modes">
              <button
                id="tab-text-editor"
                onClick={handleNewRule}
                className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center btn-hover-effect
                  ${creationMode === 'direct' && !showWizard && !showVisualBuilder ? 
                  'bg-gradient-to-br from-brand-teal to-brand-teal-light text-white shadow-md' : 
                  'bg-white text-brand-charcoal shadow-sm hover:bg-neutral-50'}`}
                role="tab"
                aria-selected={creationMode === 'direct' && !showWizard && !showVisualBuilder}
                aria-controls="panel-text-editor"
                tabIndex={creationMode === 'direct' && !showWizard && !showVisualBuilder ? 0 : -1}
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                  {t(language, 'navigation.textEditor')}
                </div>
              </button>
              
              <button
                id="tab-visual-builder"
                onClick={handleStartVisualBuilder}
                className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center relative btn-hover-effect
                  ${showVisualBuilder ? 
                  'bg-gradient-to-br from-brand-coral to-brand-coral-light text-white shadow-md' : 
                  'bg-white text-brand-charcoal shadow-sm hover:bg-neutral-50'}`}
                role="tab"
                aria-selected={showVisualBuilder}
                aria-controls="panel-visual-builder"
                tabIndex={showVisualBuilder ? 0 : -1}
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"></path>
                  </svg>
                  {t(language, 'navigation.visualBuilder')}
                </div>
                
                {/* Pulsing NEW badge - draws attention to this option */}
                {!showVisualBuilder && (
                  <span className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-gradient-to-r from-brand-mustard to-brand-mustard-light text-white text-xs font-bold rounded-full animate-pulse shadow-sm" aria-hidden="true">
                    {t(language, 'navigation.new')}
                  </span>
                )}
              </button>
              
              <button
                id="tab-guided-wizard"
                onClick={handleStartWizard}
                className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center btn-hover-effect
                  ${showWizard ? 
                  'bg-gradient-to-br from-brand-mustard to-brand-mustard-light text-white shadow-md' : 
                  'bg-white text-brand-charcoal shadow-sm hover:bg-neutral-50'}`}
                role="tab"
                aria-selected={showWizard}
                aria-controls="panel-guided-wizard"
                tabIndex={showWizard ? 0 : -1}
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                  </svg>
                  {t(language, 'navigation.guidedWizard')}
                </div>
              </button>
              
              <button
                id="tab-templates"
                onClick={handleOpenTemplates}
                className="px-4 py-3 rounded-lg font-medium bg-white text-brand-charcoal shadow-sm hover:bg-neutral-50 transition-all duration-200 flex items-center justify-center btn-hover-effect"
                role="tab"
                aria-selected={showTemplates}
                tabIndex={0}
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                  </svg>
                  {t(language, 'navigation.templates')}
                </div>
              </button>
            </div>
            
            {/* Settings toggles */}
            <div className="ml-auto flex flex-wrap items-center gap-4 sm:flex-nowrap sm:gap-6 bg-white p-3 rounded-lg shadow-card border border-neutral-200/50">
              <label className="inline-flex items-center cursor-pointer" htmlFor="suggestions-toggle">
                <input
                  type="checkbox"
                  id="suggestions-toggle"
                  checked={suggestionsEnabled}
                  onChange={toggleSuggestions}
                  className="sr-only peer"
                  aria-describedby="suggestions-label"
                />
                <div className="relative w-9 h-5 bg-neutral-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-teal/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-brand-teal peer-checked:to-brand-teal-light"></div>
                <span id="suggestions-label" className="ml-1.5 text-xs font-medium text-brand-charcoal-light">
                  {t(language, 'editorSettings.suggestions')}
                </span>
              </label>
              
              <label className="inline-flex items-center cursor-pointer" htmlFor="realtime-toggle">
                <input
                  type="checkbox"
                  id="realtime-toggle"
                  checked={realtimeTranslationEnabled}
                  onChange={toggleRealtimeTranslation}
                  className="sr-only peer"
                  aria-describedby="realtime-label"
                />
                <div className="relative w-9 h-5 bg-neutral-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-coral/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-brand-coral peer-checked:to-brand-coral-light"></div>
                <span id="realtime-label" className="ml-1.5 text-xs font-medium text-brand-charcoal-light">
                  {t(language, 'editorSettings.realtime')}
                </span>
              </label>
              
              <label className="inline-flex items-center cursor-pointer" htmlFor="inline-toggle">
                <input
                  type="checkbox"
                  id="inline-toggle"
                  checked={inlineSuggestionsEnabled}
                  onChange={toggleInlineSuggestions}
                  className="sr-only peer"
                  aria-describedby="inline-label"
                />
                <div className="relative w-9 h-5 bg-neutral-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-mustard/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-brand-mustard peer-checked:to-brand-mustard-light"></div>
                <span id="inline-label" className="ml-1.5 text-xs font-medium text-brand-charcoal-light">
                  {t(language, 'editorSettings.inlineHelp')}
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Sidebar - Saved Rules & Version History */}
          <div className="md:col-span-1">
            <div className="card card-hover mb-4 animate-fade-in">
              <div className="p-4 border-b border-neutral-100 bg-gradient-to-r from-brand-teal-light/5 to-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-brand-charcoal flex items-center">
                    <svg className="w-4 h-4 mr-1.5 text-brand-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    {t(language, 'savedRules.title')}
                  </h2>
                  <button
                    onClick={handleNewRule}
                    className="p-1.5 rounded-full bg-brand-teal-light/20 text-brand-teal hover:bg-brand-teal-light/30 hover:text-brand-teal-dark transition-colors duration-200 hover:scale-105 transform"
                    title="Create new rule"
                    aria-label="Create new rule"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {savedRules.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <div className="w-16 h-16 mx-auto mb-3 bg-brand-teal-light/10 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-brand-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-brand-charcoal-light text-sm font-medium">{t(language, 'savedRules.noRules')}</p>
                  <button 
                    onClick={handleNewRule}
                    className="mt-3 text-brand-teal hover:text-brand-teal-dark btn-hover-effect text-xs font-semibold inline-flex items-center"
                  >
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"></path>
                    </svg>
                    {t(language, 'savedRules.createFirst')}
                  </button>
                </div>
              ) : (
                <ul className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
                  {savedRules.map((rule) => (
                    <li key={rule.id} className="hover:bg-slate-50 transition-colors duration-150">
                      <div className="p-3">
                        <div className="flex justify-between items-center">
                          <button
                            onClick={() => handleLoadRule(rule.id)}
                            className="text-left font-medium text-slate-800 hover:text-indigo-600 text-sm truncate max-w-[160px] transition-colors duration-150"
                          >
                            {rule.name}
                          </button>
                          <button
                            onClick={() => handleDeleteRule(rule.id)}
                            className="p-1 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors duration-150"
                            title="Delete rule"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 truncate">
                          {rule.naturalLanguage}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Version History */}
            {currentRule && (
              <div className="card card-hover animate-fade-in">
                <div className="p-4 border-b border-neutral-100 bg-gradient-to-r from-brand-mustard-light/5 to-white">
                  <div 
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => setShowVersionHistory(!showVersionHistory)}
                  >
                    <h2 className="text-sm font-semibold text-brand-charcoal flex items-center">
                      <svg className="w-4 h-4 mr-1.5 text-brand-mustard" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      {t(language, 'versionHistory.title')}
                    </h2>
                    <span className={`text-brand-charcoal-light transition-transform duration-200 ${showVersionHistory ? 'rotate-180' : ''}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </span>
                  </div>
                </div>
                
                {showVersionHistory && currentRule.versions && currentRule.versions.length > 0 && (
                  <ul className="divide-y divide-neutral-100 text-xs max-h-[250px] overflow-y-auto">
                    {currentRule.versions.map((version, index) => (
                      <li key={index} className="hover:bg-neutral-50 transition-colors duration-150">
                        <div className="p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-brand-charcoal-light font-medium">
                                {formatTimestamp(version.timestamp)}
                              </p>
                              {version.isReversion && (
                                <p className="text-brand-teal flex items-center mt-1">
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                  </svg>
                                  {t(language, 'versionHistory.revertPrefix')}{version.revertedFromVersion + 1}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => handleRevertToVersion(index)}
                              disabled={currentRule.ruleCode === version.ruleCode}
                              className={`px-2 py-1 rounded-md text-xs font-medium transition-all duration-150 ${
                                currentRule.ruleCode === version.ruleCode
                                  ? 'bg-brand-teal-light/10 text-brand-teal-light cursor-not-allowed'
                                  : 'text-brand-teal hover:bg-brand-teal-light/20 hover:text-brand-teal-dark btn-hover-effect'
                              }`}
                            >
                              {currentRule.ruleCode === version.ruleCode
                                ? t(language, 'versionHistory.current')
                                : t(language, 'versionHistory.revert')}
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="md:col-span-4">
            {showWizard ? (
              <RuleWizard 
                apiKey={apiKey} 
                onRuleGenerated={handleWizardRuleGenerated} 
                onCancel={() => setShowWizard(false)}
              />
            ) : showVisualBuilder ? (
              <VisualRuleBuilder
                onRuleChange={handleVisualRuleGenerated}
              />
            ) : (
              <div className="space-y-6">
                <div className="card card-hover animate-fade-in">
                  <div className="px-6 pt-5 pb-3">
                    {/* Rule Name */}
                    <div className="mb-5">
                      <input
                        type="text"
                        id="ruleName"
                        value={ruleName}
                        onChange={(e) => setRuleName(e.target.value)}
                        placeholder={t(language, 'editor.ruleNamePlaceholder')}
                        className="w-full px-3 py-2.5 text-xl font-semibold text-brand-charcoal border-0 border-b-2 border-neutral-100 focus:border-brand-teal-light/50 focus:outline-none focus:ring-0 transition-colors duration-200 font-heading"
                      />
                    </div>
                    
                    {/* Natural Language Input */}
                    <div className="relative">
                      <div className="flex items-center mb-2">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-teal-light/20 flex items-center justify-center mr-2" aria-hidden="true">
                          <svg className="w-4 h-4 text-brand-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
                          </svg>
                        </div>
                        <label htmlFor="naturalLanguage" className="text-sm font-medium text-brand-charcoal">
                          {t(language, 'editor.describeRule')}
                        </label>
                      </div>
                      <div className="relative">
                        <textarea
                          id="naturalLanguage"
                          ref={textareaRef}
                          value={naturalLanguageRule}
                          onChange={(e) => setNaturalLanguageRule(e.target.value)}
                          placeholder={t(language, 'editor.placeholder')}
                          rows={3}
                          className="w-full px-4 py-3 border border-neutral-200 rounded-lg shadow-sm focus-ring text-brand-charcoal placeholder:text-neutral-400 text-base bg-white/90"
                          aria-describedby="nl-input-desc"
                          accessKey="i"
                        />
                        
                        <div id="nl-input-desc" className="sr-only">
                          {t(language, 'editor.accessibilityDesc')}
                        </div>
                        
                        {/* Inline suggestions */}
                        {inlineSuggestionsEnabled && (
                          <InlineSuggestions
                            inputText={naturalLanguageRule}
                            onSuggestionAccept={handleAcceptInlineSuggestion}
                            apiKey={apiKey}
                            isActive={inlineSuggestionsEnabled && !!apiKey && creationMode === 'direct' && !showWizard && !showVisualBuilder}
                            language={language}
                          />
                        )}
                      </div>
                      
                      <ContextualSuggestions
                        inputText={naturalLanguageRule}
                        onSuggestionSelect={handleSuggestionSelect}
                        apiKey={apiKey}
                        isActive={suggestionsEnabled && !!apiKey && creationMode === 'direct' && !showWizard && !showVisualBuilder}
                        language={language}
                        className="mb-4"
                      />
                    </div>
                    
                    <div className="flex items-center justify-end mt-3 mb-2">
                      {realtimeTranslationEnabled ? (
                        <span className="flex items-center text-brand-coral text-sm font-medium" aria-live="polite">
                          <svg className="w-4 h-4 mr-1.5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                          </svg>
                          {t(language, 'editor.realtimeActive')}
                        </span>
                      ) : (
                        <button
                          onClick={handleTranslate}
                          disabled={isTranslating || !naturalLanguageRule || !apiKey}
                          className={`btn-primary ${
                            isTranslating || !naturalLanguageRule || !apiKey
                              ? 'opacity-50 cursor-not-allowed'
                              : ''
                          }`}
                          aria-busy={isTranslating}
                          aria-disabled={isTranslating || !naturalLanguageRule || !apiKey}
                          accessKey="t"
                        >
                          {isTranslating ? (
                            <span className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              {t(language, 'editor.translating')}
                            </span>
                          ) : t(language, 'editor.translate')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Generated Rule Code */}
                <div className="card card-hover animate-fade-in">
                  <div className="px-6 pt-5 pb-6">
                    <div className="flex items-center mb-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-coral-light/20 flex items-center justify-center mr-2" aria-hidden="true">
                        <svg className="w-4 h-4 text-brand-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
                        </svg>
                      </div>
                      <h2 className="text-sm font-medium text-brand-charcoal">{t(language, 'editor.generatedRule')}</h2>
                      {realtimeTranslationEnabled && naturalLanguageRule && (
                        <span className="ml-2 px-2 py-0.5 bg-brand-coral-light/20 text-brand-coral-dark text-xs rounded-full border border-brand-coral-light/30">
                          Auto-updating
                        </span>
                      )}
                    </div>
                    
                    <RuleEditor
                      value={generatedRule}
                      onChange={setGeneratedRule}
                      height="200px"
                      isLoading={isTranslating}
                      language="javascript"
                    />
                    
                    {/* Action Buttons */}
                    <div className="flex items-center justify-between mt-5">
                      <button
                        onClick={handleValidate}
                        disabled={isValidating || !generatedRule || !apiKey}
                        className={`btn-success flex items-center ${
                          isValidating || !generatedRule || !apiKey
                            ? 'opacity-50 cursor-not-allowed'
                            : ''
                        }`}
                        aria-busy={isValidating}
                        aria-disabled={isValidating || !generatedRule || !apiKey}
                        accessKey="v"
                      >
                        {isValidating ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {t(language, 'editor.validating')}
                          </span>
                        ) : (
                          <>
                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            {t(language, 'editor.validate')}
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={handleSaveRule}
                        disabled={!generatedRule || !ruleName}
                        className={`btn-secondary flex items-center ${
                          !generatedRule || !ruleName
                            ? 'opacity-50 cursor-not-allowed'
                            : ''
                        }`}
                        aria-disabled={!generatedRule || !ruleName}
                        accessKey="s"
                      >
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
                        </svg>
                        {t(language, 'editor.saveRule')}
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Error Message */}
                {errorMessage && (
                  <div 
                    className="p-4 rounded-lg bg-gradient-to-r from-red-50 to-white border-l-4 border-red-500 text-red-700 animate-fade-in" 
                    role="alert"
                    aria-live="assertive"
                  >
                    <div className="flex">
                      <div className="flex-shrink-0" aria-hidden="true">
                        <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium">{errorMessage}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Validation Results */}
                {validationResult && (
                  <div 
                    className={`card animate-fade-in overflow-hidden ${
                      validationResult.isValid ? 'border-l-4 border-emerald-500' : 'border-l-4 border-amber-500'
                    }`}
                    role="region"
                    aria-label={t(language, validationResult.isValid ? 'validation.passed' : 'validation.issues')}
                    aria-live="polite"
                  >
                    <div className={`p-4 ${
                      validationResult.isValid
                        ? 'bg-gradient-to-r from-emerald-50 to-white'
                        : 'bg-gradient-to-r from-amber-50 to-white'
                    }`}>
                      <div className="flex items-center">
                        {validationResult.isValid ? (
                          <div className="flex-shrink-0 bg-emerald-100 rounded-full p-1" aria-hidden="true">
                            <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        ) : (
                          <div className="flex-shrink-0 bg-amber-100 rounded-full p-1" aria-hidden="true">
                            <svg className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          </div>
                        )}
                        <h3 className="ml-3 text-base font-semibold text-slate-800">
                          {t(language, validationResult.isValid ? 'validation.passed' : 'validation.issues')}
                        </h3>
                      </div>
                    </div>
                    
                    <div className="px-6 py-4">
                      {validationResult.errors && validationResult.errors.length > 0 && (
                        <div className="mb-4">
                          <h4 id="validation-errors-heading" className="text-sm font-semibold text-slate-700 mb-2 flex items-center">
                            <svg className="w-4 h-4 mr-1.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            {t(language, 'validation.errors')}
                          </h4>
                          <ul 
                            className="space-y-2"
                            aria-labelledby="validation-errors-heading"
                            role="list"
                          >
                            {validationResult.errors.map((error, index) => (
                              <li key={index} className="text-sm text-slate-600 bg-red-50 px-3 py-2 rounded-md border border-red-100 flex items-start">
                                <span className="text-red-500 mr-2" aria-hidden="true">•</span>
                                {error}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {validationResult.suggestions && validationResult.suggestions.length > 0 && (
                        <div>
                          <h4 id="validation-suggestions-heading" className="text-sm font-semibold text-slate-700 mb-2 flex items-center">
                            <svg className="w-4 h-4 mr-1.5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            {t(language, 'validation.suggestions')}
                          </h4>
                          <ul 
                            className="space-y-2"
                            aria-labelledby="validation-suggestions-heading"
                            role="list"
                          >
                            {validationResult.suggestions.map((suggestion, index) => (
                              <li key={index} className="text-sm text-slate-600 bg-indigo-50 px-3 py-2 rounded-md border border-indigo-100 flex items-start">
                                <span className="text-indigo-500 mr-2" aria-hidden="true">•</span>
                                {suggestion}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Validation Toast Notification */}
        <ValidationToast
          validationResult={validationResult}
          isVisible={showValidationToast}
          onClose={() => setShowValidationToast(false)}
          onFix={handleFixRule}
          position="bottom-right"
        />
        
        {/* Rule Fix Modal */}
        <RuleFixModal
          isOpen={showFixModal}
          onClose={() => setShowFixModal(false)}
          fixResult={fixResult}
          onApplyFix={handleApplyFix}
        />
      </div>
      </div>
    </div>
  );
}