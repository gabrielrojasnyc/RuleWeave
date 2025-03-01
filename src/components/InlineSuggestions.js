import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const InlineSuggestions = ({ 
  inputText, 
  onSuggestionAccept,
  apiKey,
  isActive = true,
  language = 'en'
}) => {
  const [suggestion, setSuggestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const suggestionTimeout = useRef(null);
  const lastInputLength = useRef(0);

  // Generate inline suggestion based on current input
  const generateSuggestion = async (text) => {
    if (!text.trim() || !apiKey || !isActive) {
      setSuggestion('');
      return;
    }

    // Only generate suggestions if the user has added text (not deleted)
    if (text.length < lastInputLength.current) {
      lastInputLength.current = text.length;
      return;
    }
    
    lastInputLength.current = text.length;
    
    // Don't generate suggestions for very short inputs
    if (text.length < 10) {
      setSuggestion('');
      return;
    }

    setIsLoading(true);
    
    try {
      // This would be a real API call in production
      // Here we're simulating it with setTimeout
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Simulate a suggestion based on the input
      // This would be replaced with a real API call to Claude
      let suggestedText = '';
      
      // Simple simulation of suggestions based on input text patterns
      if (text.includes('transactions') && text.includes('over')) {
        suggestedText = ' $500 from new users';
      } else if (text.includes('users') && text.includes('in')) {
        suggestedText = ' high-risk countries';
      } else if (text.includes('revenue') && text.includes('less than')) {
        suggestedText = ' 1,000,000 per month';
      } else if (text.toLowerCase().includes('muestra') || text.toLowerCase().includes('todas') || text.toLowerCase().includes('personas')) {
        // Example of suggestions for Spanish text
        suggestedText = ' que ganan menos de 100 dólares';
      }
      
      setSuggestion(suggestedText);
    } catch (error) {
      console.error('Error generating inline suggestion:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle input changes with debounce
  useEffect(() => {
    if (suggestionTimeout.current) {
      clearTimeout(suggestionTimeout.current);
    }
    
    suggestionTimeout.current = setTimeout(() => {
      generateSuggestion(inputText);
    }, 500);
    
    return () => {
      if (suggestionTimeout.current) {
        clearTimeout(suggestionTimeout.current);
      }
    };
  }, [inputText, apiKey, isActive]);
  
  // Accept suggestion by pressing Tab key
  const handleKeyDown = (e) => {
    if (e.key === 'Tab' && suggestion && !isLoading) {
      e.preventDefault();
      if (onSuggestionAccept) {
        onSuggestionAccept(suggestion);
      }
    }
  };
  
  useEffect(() => {
    // Add event listener for Tab key to accept suggestion
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [suggestion, isLoading]);
  
  // If not active or no input text, don't render
  if (!isActive || !inputText || inputText.length < 10) {
    return null;
  }
  
  // Only render the hint if there's a suggestion
  if (suggestion && !isLoading) {
    return (
      <div className="absolute bottom-[-30px] left-2 z-10 pointer-events-none">
        <div className="text-xs font-medium text-brand-teal bg-white/90 px-2 py-1 rounded-md shadow-sm inline-block border border-brand-teal-light/20">
          Press Tab to accept suggestion
        </div>
      </div>
    );
  }
  
  // If no suggestion or we're loading, don't show anything
  return null;
};

export default InlineSuggestions;