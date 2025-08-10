import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CarSearchInput = ({ onSearch, onSuggestionSelect, suggestions = [], loading }) => {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);
    setSelectedIndex(-1);
    
    if (value.length >= 2) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSearch(input.trim());
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion.plateNumber);
    setShowSuggestions(false);
    onSuggestionSelect(suggestion);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        if (selectedIndex >= 0) {
          e.preventDefault();
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => input.length >= 2 && setShowSuggestions(true)}
            placeholder="Enter plate number (e.g., ABC-1234)"
            className="w-full px-4 py-3 pr-12 text-lg border-2 border-gray-300 rounded-xl 
                     focus:border-church-primary focus:outline-none transition-colors
                     placeholder-gray-400 bg-white shadow-sm"
            disabled={loading}
          />
          
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 
                     p-2 text-church-primary hover:text-church-secondary 
                     disabled:text-gray-400 transition-colors"
          >
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5 border-2 border-church-primary border-t-transparent rounded-full"
              />
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </button>
        </div>

        {/* Search Suggestions */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 
                       rounded-lg shadow-lg z-50 overflow-hidden"
            >
              {suggestions.map((suggestion, index) => (
                <motion.button
                  key={suggestion.plateNumber}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0
                           ${selectedIndex === index ? 'bg-church-primary/10' : ''}`}
                  whileHover={{ backgroundColor: '#f9fafb' }}
                >
                  <div className="font-medium text-gray-900">
                    {suggestion.plateNumber}
                  </div>
                  <div className="text-sm text-gray-600">
                    {suggestion.displayText}
                  </div>
                  <div className="text-xs text-gray-500">
                    {suggestion.vehicle}
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      {/* Search Tips */}
      <div className="mt-2 text-xs text-gray-500 text-center">
        <span className="inline-block">💡 Try: ABC1234, ABC-1234, or ABC 1234</span>
      </div>
    </div>
  );
};

export default CarSearchInput;