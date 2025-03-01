import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const ContextualSuggestions = ({ 
  inputText, 
  onSuggestionSelect, 
  apiKey,
  isActive = true,
  className = '' 
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const suggestionTimeout = useRef(null);
  const suggestionsContainerRef = useRef(null);

  // Categories for different types of suggestions
  const SUGGESTION_CATEGORIES = {
    ENTITY: 'entity',
    CONDITION: 'condition',
    ACTION: 'action',
    VALUE: 'value'
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case SUGGESTION_CATEGORIES.ENTITY:
        return 'badge-entity';
      case SUGGESTION_CATEGORIES.CONDITION:
        return 'badge-condition';
      case SUGGESTION_CATEGORIES.ACTION:
        return 'badge-action';
      case SUGGESTION_CATEGORIES.VALUE:
        return 'badge-value';
      default:
        return 'bg-neutral-100 text-brand-charcoal border-neutral-300';
    }
  };

  // Get contextual suggestions based on input text
  const fetchSuggestions = async (text) => {
    if (!text.trim() || !apiKey || !isActive) {
      setSuggestions([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.post('/api/suggest', {
        text,
        apiKey
      });

      if (response.data && response.data.suggestions) {
        setSuggestions(response.data.suggestions);
        setSelectedIndex(-1); // Reset selection on new suggestions
      }
    } catch (err) {
      console.error('Error fetching suggestions:', err);
      setError('Failed to get suggestions');
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce the API call to avoid excessive requests
  useEffect(() => {
    if (suggestionTimeout.current) {
      clearTimeout(suggestionTimeout.current);
    }

    if (inputText && inputText.trim().length > 2 && apiKey && isActive) {
      // Wait 500ms after the user stops typing before making a request
      suggestionTimeout.current = setTimeout(() => {
        fetchSuggestions(inputText);
      }, 500);
    } else {
      setSuggestions([]);
    }

    return () => {
      if (suggestionTimeout.current) {
        clearTimeout(suggestionTimeout.current);
      }
    };
  }, [inputText, apiKey, isActive]);

  // Handle keyboard navigation of suggestions
  const handleKeyDown = (e) => {
    if (!suggestions.length) return;

    // Down arrow
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    }
    // Up arrow
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => prev > 0 ? prev - 1 : 0);
    }
    // Enter to select
    else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[selectedIndex]);
    }
    // Escape to close
    else if (e.key === 'Escape') {
      setSuggestions([]);
    }
  };

  // Scroll the selected suggestion into view
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionsContainerRef.current) {
      const selectedElement = suggestionsContainerRef.current.children[selectedIndex];
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }
    }
  }, [selectedIndex]);

  // Handle when a suggestion is clicked
  const handleSuggestionClick = (suggestion) => {
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion);
    }
    setSuggestions([]);
  };

  // If there are no suggestions or we're not active, don't render
  if (!isActive || !suggestions.length && !isLoading) {
    return null;
  }

  return (
    <div 
      className={`relative mt-1 ${className}`}
      onKeyDown={handleKeyDown}
    >
      
      <div 
        className="absolute z-10 left-0 w-full mt-2 bg-white border-2 border-brand-teal-light/30 rounded-lg shadow-xl max-h-80 overflow-y-auto card animate-fade-in"
        ref={suggestionsContainerRef}
        style={{ top: '100%', minWidth: '350px' }}
      >
        {isLoading ? (
          <div className="p-4 text-center">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-brand-teal-light border-t-brand-teal inline-block"></div>
              <span className="ml-3 text-brand-charcoal text-base font-medium">Loading...</span>
            </div>
          </div>
        ) : error ? (
          <div className="p-4 text-center text-brand-coral text-sm font-medium">{error}</div>
        ) : (
          <ul className="py-2">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                className={`px-4 py-3.5 cursor-pointer hover:bg-brand-teal-light/10 flex items-start gap-4 transition-colors duration-150 ${
                  index === selectedIndex ? 'bg-brand-teal-light/20' : ''
                }`}
                onClick={() => handleSuggestionClick(suggestion)}
                role="option"
                aria-selected={index === selectedIndex}
              >
                <span className={`px-3 py-1.5 text-sm rounded-full border-2 ${getCategoryColor(suggestion.category)} font-medium shadow-sm`}>
                  {suggestion.category}
                </span>
                <div className="flex-1">
                  <div className="font-semibold text-brand-charcoal text-base">{suggestion.text}</div>
                  {suggestion.description && (
                    <div className="text-sm text-brand-charcoal-light mt-1">{suggestion.description}</div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ContextualSuggestions;