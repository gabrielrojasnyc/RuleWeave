import React, { useState, useRef, useEffect } from 'react';

// Supported languages with their codes and names
const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
];

const LanguageSelector = ({ selectedLanguage, onLanguageChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Find the selected language object
  const currentLanguage = SUPPORTED_LANGUAGES.find(lang => lang.code === selectedLanguage) || SUPPORTED_LANGUAGES[0];
  
  // Close the dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);
  
  // Handle keyboard navigation within the dropdown
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }
    
    if (e.key === 'Escape') {
      setIsOpen(false);
      return;
    }
    
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const currentIndex = SUPPORTED_LANGUAGES.findIndex(lang => lang.code === selectedLanguage);
      const nextIndex = e.key === 'ArrowDown' 
        ? (currentIndex + 1) % SUPPORTED_LANGUAGES.length 
        : (currentIndex - 1 + SUPPORTED_LANGUAGES.length) % SUPPORTED_LANGUAGES.length;
      
      onLanguageChange(SUPPORTED_LANGUAGES[nextIndex].code);
    }
  };
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className="flex items-center space-x-2 text-sm py-2 px-3 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors duration-150 focus-ring"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={`Current language: ${currentLanguage.name}. Click to change language.`}
      >
        <span className="text-lg" aria-hidden="true">{currentLanguage.flag}</span>
        <span className="font-medium">{currentLanguage.name}</span>
        <svg 
          className={`h-4 w-4 text-slate-500 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
      
      {isOpen && (
        <div 
          className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 z-50"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="language-menu"
        >
          {SUPPORTED_LANGUAGES.map((language) => (
            <button
              key={language.code}
              onClick={() => {
                onLanguageChange(language.code);
                setIsOpen(false);
              }}
              className={`flex items-center w-full text-left px-4 py-2.5 text-sm focus-ring transition-colors duration-150 hover:bg-slate-100 ${
                selectedLanguage === language.code ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700'
              }`}
              role="menuitem"
              aria-selected={selectedLanguage === language.code}
            >
              <span className="text-lg mr-2">{language.flag}</span>
              <span className="font-medium">{language.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;