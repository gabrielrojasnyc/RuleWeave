import React, { useState, useRef, useEffect } from 'react';
import { t } from '../utils/translations';

const AccessibilityPanel = ({ language = 'en', onTextSizeChange, onHighContrastChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [textSize, setTextSize] = useState('medium'); // small, medium, large, x-large
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const panelRef = useRef(null);
  const buttonRef = useRef(null);
  
  // Check system preferences on initial load
  useEffect(() => {
    // Check for OS-level reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setReducedMotion(true);
    }
    
    // Check for OS-level high contrast preference
    const prefersHighContrast = window.matchMedia('(prefers-contrast: more)').matches;
    if (prefersHighContrast) {
      setHighContrast(true);
    }
    
    // Check for saved user preferences in localStorage
    const savedTextSize = localStorage.getItem('ruleweave-textsize');
    const savedHighContrast = localStorage.getItem('ruleweave-highcontrast');
    const savedReducedMotion = localStorage.getItem('ruleweave-reducedmotion');
    
    if (savedTextSize) setTextSize(savedTextSize);
    if (savedHighContrast) setHighContrast(savedHighContrast === 'true');
    if (savedReducedMotion) setReducedMotion(savedReducedMotion === 'true');
  }, []);
  
  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && 
          !panelRef.current.contains(event.target) && 
          buttonRef.current && 
          !buttonRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [panelRef, buttonRef]);
  
  // Apply text size to the document
  useEffect(() => {
    const html = document.documentElement;
    
    // Reset all size classes
    html.classList.remove('text-size-small', 'text-size-medium', 'text-size-large', 'text-size-xlarge');
    
    // Apply selected size
    html.classList.add(`text-size-${textSize}`);
    
    // Save to localStorage
    localStorage.setItem('ruleweave-textsize', textSize);
    
    if (onTextSizeChange) {
      onTextSizeChange(textSize);
    }
  }, [textSize, onTextSizeChange]);
  
  // Apply high contrast mode to the document
  useEffect(() => {
    const html = document.documentElement;
    
    if (highContrast) {
      html.setAttribute('data-high-contrast', 'true');
    } else {
      html.removeAttribute('data-high-contrast');
    }
    
    // Save to localStorage
    localStorage.setItem('ruleweave-highcontrast', highContrast.toString());
    
    if (onHighContrastChange) {
      onHighContrastChange(highContrast);
    }
  }, [highContrast, onHighContrastChange]);
  
  // Apply reduced motion mode to the document
  useEffect(() => {
    const html = document.documentElement;
    
    if (reducedMotion) {
      html.setAttribute('data-reduced-motion', 'true');
    } else {
      html.removeAttribute('data-reduced-motion');
    }
    
    // Save to localStorage
    localStorage.setItem('ruleweave-reducedmotion', reducedMotion.toString());
  }, [reducedMotion]);
  
  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      buttonRef.current?.focus();
    }
    
    // Close panel with Tab or Shift+Tab if the focus would move out of the panel
    if (e.key === 'Tab') {
      // We would need more complex logic here to check if we're on the last focusable element
      // For simplicity, not fully implemented
    }
  };
  
  // Toggle panel and manage focus
  const handleTogglePanel = () => {
    setIsOpen(!isOpen);
  };
  
  // Handle text size change with keyboard accessible method
  const handleTextSizeChange = (size) => {
    setTextSize(size);
    // Announce to screen readers
    const announcement = document.getElementById('a11y-announcement');
    if (announcement) {
      announcement.textContent = `${t(language, 'accessibility.textSizeChanged')} ${size}`;
    }
  };
  
  return (
    <div className="relative" onKeyDown={handleKeyDown}>
      {/* Live region for accessibility announcements */}
      <div 
        id="a11y-announcement" 
        className="sr-only" 
        aria-live="polite" 
        aria-atomic="true"
      ></div>
      
      {/* Skip to content link - always available but only visible on focus */}
      <a href="#main-content" className="skip-link">
        {t(language, 'accessibility.skipToContent')}
      </a>
      
      {/* Accessibility Button */}
      <button
        ref={buttonRef}
        onClick={handleTogglePanel}
        className="flex items-center p-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 focus-ring transition-colors duration-150"
        aria-label={t(language, 'accessibility.settings')}
        aria-expanded={isOpen}
        aria-controls="accessibility-panel"
        title={t(language, 'accessibility.settings')}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
        </svg>
      </button>
      
      {/* Accessibility Panel */}
      {isOpen && (
        <div 
          ref={panelRef}
          id="accessibility-panel"
          className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-slate-200 z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="accessibility-title"
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 
                id="accessibility-title" 
                className="text-sm font-semibold text-slate-800 flex items-center"
              >
                <svg className="w-4 h-4 mr-1.5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                {t(language, 'accessibility.settings')}
              </h2>
              
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors duration-150"
                aria-label={t(language, 'general.close')}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            {/* Skip to content button */}
            <a 
              href="#main-content" 
              className="block w-full text-left px-3 py-2.5 text-sm focus-ring rounded-md mb-4 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors duration-150"
            >
              {t(language, 'accessibility.skipToContent')}
            </a>
            
            {/* Text Size Controls */}
            <div className="mb-5">
              <label id="text-size-label" className="block text-sm font-medium text-slate-700 mb-2">
                {t(language, 'accessibility.textSize')}
              </label>
              <div 
                className="flex space-x-2" 
                role="radiogroup" 
                aria-labelledby="text-size-label"
              >
                <button
                  onClick={() => handleTextSizeChange('small')}
                  className={`flex-1 py-2.5 px-3 rounded-md text-xs focus-ring 
                    ${textSize === 'small' 
                      ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-transparent'
                    }`}
                  aria-pressed={textSize === 'small'}
                  role="radio"
                  aria-checked={textSize === 'small'}
                >
                  A<span className="sr-only"> ({t(language, 'accessibility.small')})</span>
                </button>
                <button
                  onClick={() => handleTextSizeChange('medium')}
                  className={`flex-1 py-2.5 px-3 rounded-md text-sm focus-ring 
                    ${textSize === 'medium' 
                      ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-transparent'
                    }`}
                  aria-pressed={textSize === 'medium'}
                  role="radio"
                  aria-checked={textSize === 'medium'}
                >
                  A<span className="sr-only"> ({t(language, 'accessibility.medium')})</span>
                </button>
                <button
                  onClick={() => handleTextSizeChange('large')}
                  className={`flex-1 py-2.5 px-3 rounded-md text-base focus-ring 
                    ${textSize === 'large' 
                      ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-transparent'
                    }`}
                  aria-pressed={textSize === 'large'}
                  role="radio"
                  aria-checked={textSize === 'large'}
                >
                  A<span className="sr-only"> ({t(language, 'accessibility.large')})</span>
                </button>
                <button
                  onClick={() => handleTextSizeChange('xlarge')}
                  className={`flex-1 py-2.5 px-3 rounded-md text-lg focus-ring 
                    ${textSize === 'xlarge' 
                      ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-transparent'
                    }`}
                  aria-pressed={textSize === 'xlarge'}
                  role="radio"
                  aria-checked={textSize === 'xlarge'}
                >
                  A<span className="sr-only"> ({t(language, 'accessibility.extraLarge')})</span>
                </button>
              </div>
            </div>
            
            {/* High Contrast Toggle */}
            <div className="mb-5">
              <label htmlFor="high-contrast" className="flex items-center justify-between cursor-pointer">
                <span className="text-sm font-medium text-slate-700">
                  {t(language, 'accessibility.highContrast')}
                </span>
                <div className="relative ml-3">
                  <input
                    id="high-contrast"
                    type="checkbox"
                    className="sr-only peer"
                    checked={highContrast}
                    onChange={() => setHighContrast(!highContrast)}
                    aria-describedby="high-contrast-description"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-slate-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </div>
              </label>
              <p id="high-contrast-description" className="text-xs text-slate-500 mt-1 ml-1">
                {t(language, 'accessibility.highContrastDescription')}
              </p>
            </div>
            
            {/* Reduced Motion Toggle */}
            <div className="mb-5">
              <label htmlFor="reduced-motion" className="flex items-center justify-between cursor-pointer">
                <span className="text-sm font-medium text-slate-700">
                  {t(language, 'accessibility.reducedMotion')}
                </span>
                <div className="relative ml-3">
                  <input
                    id="reduced-motion"
                    type="checkbox"
                    className="sr-only peer"
                    checked={reducedMotion}
                    onChange={() => setReducedMotion(!reducedMotion)}
                    aria-describedby="reduced-motion-description"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-slate-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </div>
              </label>
              <p id="reduced-motion-description" className="text-xs text-slate-500 mt-1 ml-1">
                {t(language, 'accessibility.reducedMotionDescription')}
              </p>
            </div>
            
            {/* Keyboard Shortcuts Section */}
            <div>
              <h3 className="text-sm font-medium text-slate-700 mb-2">
                {t(language, 'accessibility.keyboardShortcuts')}
              </h3>
              <div className="bg-slate-50 rounded-md p-3 text-xs">
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span className="text-slate-600">{t(language, 'accessibility.navigateFields')}</span>
                    <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">Tab</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-slate-600">{t(language, 'accessibility.skipToContent')}</span>
                    <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">Alt+S</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-slate-600">{t(language, 'accessibility.translateRule')}</span>
                    <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">Alt+T</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessibilityPanel;