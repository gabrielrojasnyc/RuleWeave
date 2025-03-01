import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RuleWizard = ({ apiKey, onRuleGenerated, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [ruleType, setRuleType] = useState('');
  const [ruleSubject, setRuleSubject] = useState('');
  const [ruleCondition, setRuleCondition] = useState('');
  const [ruleValue, setRuleValue] = useState('');
  const [ruleAction, setRuleAction] = useState('');
  const [isBuildingRule, setIsBuildingRule] = useState(false);
  const [error, setError] = useState('');
  const [naturalLanguageRule, setNaturalLanguageRule] = useState('');

  // Available options for each step
  const ruleTypes = ['Transaction', 'User', 'Location', 'Revenue'];
  
  const subjectOptions = {
    Transaction: ['amount', 'date', 'type', 'currency', 'status'],
    User: ['age', 'country', 'is_new', 'registration_date', 'activity_level'],
    Location: ['state', 'country', 'city', 'zip_code'],
    Revenue: ['weekly_revenue', 'monthly_revenue', 'annual_revenue']
  };
  
  const conditionOptions = ['greater than', 'less than', 'equal to', 'not equal to', 'contains', 'does not contain', 'in', 'not in'];
  
  const actionOptions = ['flag', 'block', 'approve', 'review', 'select', 'exclude'];

  // Update natural language rule whenever user makes changes
  useEffect(() => {
    if (ruleType && ruleSubject && ruleCondition && ruleValue) {
      let rule = '';
      
      if (ruleAction) {
        rule = `${ruleAction} ${ruleType.toLowerCase()}s where ${ruleSubject} is ${ruleCondition} ${ruleValue}`;
      } else {
        rule = `${ruleType.toLowerCase()}s where ${ruleSubject} is ${ruleCondition} ${ruleValue}`;
      }
      
      setNaturalLanguageRule(rule);
    }
  }, [ruleType, ruleSubject, ruleCondition, ruleValue, ruleAction]);

  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleBuildRule = async () => {
    if (!apiKey) {
      setError('API key is required');
      return;
    }

    setIsBuildingRule(true);
    setError('');

    try {
      const response = await axios.post('/api/translate', {
        naturalLanguageRule,
        apiKey
      });
      
      if (response.data && response.data.rule) {
        onRuleGenerated(response.data.rule, naturalLanguageRule);
      } else {
        setError('Failed to generate rule');
      }
    } catch (error) {
      console.error('Translation error:', error);
      setError(error.response?.data?.error || 'Error translating rule');
    } finally {
      setIsBuildingRule(false);
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setRuleType('');
    setRuleSubject('');
    setRuleCondition('');
    setRuleValue('');
    setRuleAction('');
    setError('');
    setNaturalLanguageRule('');
  };

  // Render the current step of the wizard
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h3 className="text-lg font-medium mb-4">Step 1: Select Rule Type</h3>
            <p className="text-sm text-gray-500 mb-4">Choose the primary entity this rule applies to.</p>
            <div className="grid grid-cols-2 gap-3">
              {ruleTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setRuleType(type)}
                  className={`p-3 text-left border rounded-md hover:border-blue-500 transition-colors ${
                    ruleType === type 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300'
                  }`}
                >
                  <div className="font-medium">{type}</div>
                  <div className="text-sm text-gray-500">
                    Rules for {type.toLowerCase()} data
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      
      case 2:
        return (
          <div>
            <h3 className="text-lg font-medium mb-4">Step 2: Select Rule Subject</h3>
            <p className="text-sm text-gray-500 mb-4">Choose which {ruleType.toLowerCase()} attribute this rule applies to.</p>
            <div className="grid grid-cols-2 gap-3">
              {subjectOptions[ruleType].map((subject) => (
                <button
                  key={subject}
                  onClick={() => setRuleSubject(subject)}
                  className={`p-3 text-left border rounded-md hover:border-blue-500 transition-colors ${
                    ruleSubject === subject 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300'
                  }`}
                >
                  <div className="font-medium">{subject.replace('_', ' ')}</div>
                </button>
              ))}
            </div>
          </div>
        );
      
      case 3:
        return (
          <div>
            <h3 className="text-lg font-medium mb-4">Step 3: Set Condition</h3>
            <p className="text-sm text-gray-500 mb-4">Choose how to evaluate {ruleSubject.replace('_', ' ')}.</p>
            <div className="grid grid-cols-2 gap-3">
              {conditionOptions.map((condition) => (
                <button
                  key={condition}
                  onClick={() => setRuleCondition(condition)}
                  className={`p-3 text-left border rounded-md hover:border-blue-500 transition-colors ${
                    ruleCondition === condition 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300'
                  }`}
                >
                  <div className="font-medium">{condition}</div>
                </button>
              ))}
            </div>
          </div>
        );
      
      case 4:
        return (
          <div>
            <h3 className="text-lg font-medium mb-4">Step 4: Enter Value</h3>
            <p className="text-sm text-gray-500 mb-4">
              Specify the value to compare {ruleSubject.replace('_', ' ')} against.
            </p>
            <input
              type="text"
              value={ruleValue}
              onChange={(e) => setRuleValue(e.target.value)}
              placeholder={`Enter value for ${ruleSubject.replace('_', ' ')}`}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-2 text-xs text-gray-500">
              Examples: 500, "California", ["NY", "CA", "TX"], true
            </p>
          </div>
        );
      
      case 5:
        return (
          <div>
            <h3 className="text-lg font-medium mb-4">Step 5: Select Action</h3>
            <p className="text-sm text-gray-500 mb-4">Choose what happens when this rule matches.</p>
            <div className="grid grid-cols-2 gap-3">
              {actionOptions.map((action) => (
                <button
                  key={action}
                  onClick={() => setRuleAction(action)}
                  className={`p-3 text-left border rounded-md hover:border-blue-500 transition-colors ${
                    ruleAction === action 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300'
                  }`}
                >
                  <div className="font-medium">{action}</div>
                  <div className="text-sm text-gray-500">
                    {action} the {ruleType.toLowerCase()}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      
      case 6:
        return (
          <div>
            <h3 className="text-lg font-medium mb-4">Step 6: Review Rule</h3>
            <p className="text-sm text-gray-500 mb-4">
              Here's the natural language representation of your rule:
            </p>
            <div className="p-4 bg-gray-50 border border-gray-300 rounded-md mb-6">
              <p className="font-medium">{naturalLanguageRule}</p>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              If you're satisfied with the rule, click "Build Rule" to generate the structured rule code. 
              Otherwise, you can go back and make changes.
            </p>
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md">
                {error}
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  // Check if we can proceed to the next step
  const canProceed = () => {
    switch (currentStep) {
      case 1: return !!ruleType;
      case 2: return !!ruleSubject;
      case 3: return !!ruleCondition;
      case 4: return !!ruleValue;
      case 5: return !!ruleAction;
      case 6: return true;
      default: return false;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <div 
              key={step}
              className={`flex items-center justify-center w-8 h-8 rounded-full border ${
                step === currentStep
                  ? 'border-blue-500 bg-blue-500 text-white' 
                  : step < currentStep
                    ? 'border-blue-500 bg-white text-blue-500'
                    : 'border-gray-300 bg-white text-gray-300'
              }`}
            >
              {step}
            </div>
          ))}
        </div>
        <div className="relative h-2 bg-gray-200 rounded-full">
          <div 
            className="absolute top-0 left-0 h-full bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep - 1) / 5) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-[280px] mb-8">
        {renderStep()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <div>
          {currentStep > 1 && (
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md mr-2 hover:bg-gray-200"
            >
              Back
            </button>
          )}
          <button
            onClick={handleReset}
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            Reset
          </button>
        </div>
        <div>
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 mr-2"
          >
            Cancel
          </button>
          {currentStep < 6 ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`px-4 py-2 rounded-md ${
                canProceed()
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleBuildRule}
              disabled={isBuildingRule}
              className={`px-4 py-2 rounded-md ${
                isBuildingRule
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {isBuildingRule ? 'Building...' : 'Build Rule'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RuleWizard;