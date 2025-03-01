import React, { useState, useEffect } from 'react';

const ValidationToast = ({ 
  validationResult, 
  isVisible, 
  onClose, 
  onFix,
  position = 'bottom-right' 
}) => {
  const [animateIn, setAnimateIn] = useState(false);
  
  useEffect(() => {
    if (isVisible) {
      // Slight delay for animation to work properly
      setTimeout(() => {
        setAnimateIn(true);
      }, 50);
    } else {
      setAnimateIn(false);
    }
  }, [isVisible]);
  
  // Auto-hide after 10 seconds if no errors
  useEffect(() => {
    if (isVisible && validationResult?.isValid) {
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [isVisible, validationResult]);
  
  const handleClose = () => {
    setAnimateIn(false);
    // Delay closing to allow animation to complete
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  };
  
  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
      default:
        return 'bottom-4 right-4';
    }
  };
  
  if (!isVisible || !validationResult) return null;
  
  const isValid = validationResult.isValid;
  const hasErrors = validationResult.errors && validationResult.errors.length > 0;
  const hasSuggestions = validationResult.suggestions && validationResult.suggestions.length > 0;
  
  return (
    <div 
      className={`fixed z-50 ${getPositionClasses()} flex items-end justify-center px-4 py-6 pointer-events-none sm:p-6 transition-all duration-300 ease-in-out ${
        animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="max-w-sm w-full shadow-lg rounded-lg pointer-events-auto overflow-hidden">
        <div className={`relative border-l-4 ${isValid ? 'border-emerald-500' : 'border-amber-500'}`}>
          {/* Header */}
          <div className={`p-4 ${isValid ? 'bg-emerald-50' : 'bg-amber-50'} flex items-center justify-between`}>
            <div className="flex items-center">
              {isValid ? (
                <div className="flex-shrink-0 bg-emerald-100 rounded-full p-1">
                  <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : (
                <div className="flex-shrink-0 bg-amber-100 rounded-full p-1">
                  <svg className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              )}
              <h3 className="ml-3 text-base font-semibold text-slate-800">
                {isValid ? 'Validation Passed' : 'Validation Issues'}
              </h3>
            </div>
            <button
              onClick={handleClose}
              className="ml-4 inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Body: only show if there are errors or suggestions */}
          {(hasErrors || hasSuggestions) && (
            <div className="bg-white p-4">
              {/* Errors */}
              {hasErrors && (
                <div className="mb-3">
                  <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center">
                    <svg className="w-4 h-4 mr-1.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Errors
                  </h4>
                  <ul className="space-y-2 max-h-32 overflow-y-auto">
                    {validationResult.errors.map((error, index) => (
                      <li key={index} className="text-sm text-slate-600 bg-red-50 px-3 py-1.5 rounded-md border border-red-100 flex items-start">
                        <span className="text-red-500 mr-2 font-bold">•</span>
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Suggestions */}
              {hasSuggestions && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center">
                    <svg className="w-4 h-4 mr-1.5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Suggestions
                  </h4>
                  <ul className="space-y-2 max-h-32 overflow-y-auto">
                    {validationResult.suggestions.map((suggestion, index) => (
                      <li key={index} className="text-sm text-slate-600 bg-indigo-50 px-3 py-1.5 rounded-md border border-indigo-100 flex items-start">
                        <span className="text-indigo-500 mr-2 font-bold">•</span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Fix Rule button (only show for errors) */}
              {hasErrors && onFix && (
                <button
                  onClick={onFix}
                  className="mt-4 w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-sm font-medium rounded-md shadow-sm hover:from-indigo-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                  Auto-Fix Rule
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ValidationToast;