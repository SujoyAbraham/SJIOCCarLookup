import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CarSearchInput from './CarSearchInput';
import SearchResult from './SearchResult';
import { useCarSearch } from '../hooks/useCarSearch';

const MobileApp = () => {
  const [currentResult, setCurrentResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  
  const {
    searchCarNumber,
    getSearchSuggestions,
    loading: dataLoading,
    error,
    totalMembers,
    activeMembers
  } = useCarSearch();

  const [suggestions, setSuggestions] = useState([]);

  // Handle search
  const handleSearch = async (query) => {
    setIsSearching(true);
    try {
      const result = await searchCarNumber(query);
      if (result) {
        setCurrentResult(result);
      } else {
        setCurrentResult({ type: 'not_found', query });
      }
    } catch (err) {
      console.error('Search failed:', err);
      setCurrentResult({ type: 'error', message: 'Search failed. Please try again.' });
    } finally {
      setIsSearching(false);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    handleSearch(suggestion.carNumber);
  };

  // Update suggestions when typing
  useEffect(() => {
    const updateSuggestions = (input) => {
      if (input && input.length >= 2) {
        const newSuggestions = getSearchSuggestions(input);
        setSuggestions(newSuggestions);
      } else {
        setSuggestions([]);
      }
    };

    // Debounced suggestion updates would go here if needed
  }, [getSearchSuggestions]);

  const handleInputChange = (input) => {
    if (input && input.length >= 2) {
      const newSuggestions = getSearchSuggestions(input);
      setSuggestions(newSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <div className="text-xl font-medium text-red-800 mb-2">Error Loading Data</div>
          <div className="text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-church-primary/10 to-church-secondary/20">
      {/* Header */}
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white shadow-sm border-b border-gray-200"
      >
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900 mb-1">
              🏛️ SJIOC Car Lookup
            </h1>
            <p className="text-sm text-gray-600">
              Find car owners by license plate
            </p>
            {!dataLoading && (
              <div className="text-xs text-gray-500 mt-1">
                {totalMembers} vehicles • {activeMembers} active members
              </div>
            )}
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 p-4 pb-20">
        <div className="max-w-md mx-auto space-y-6">
          
          {/* Search Input */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <CarSearchInput
              onSearch={handleSearch}
              onSuggestionSelect={handleSuggestionSelect}
              onInputChange={handleInputChange}
              suggestions={suggestions}
              loading={isSearching || dataLoading}
            />
          </motion.div>

          {/* Search Result */}
          <AnimatePresence mode="wait">
            {currentResult && (
              <SearchResult
                key={currentResult.type}
                result={currentResult}
                onClose={() => setCurrentResult(null)}
              />
            )}
          </AnimatePresence>

          {/* Welcome Message (when no result) */}
          {!currentResult && !isSearching && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center space-y-4 py-8"
            >
              <div className="text-6xl">🚗</div>
              <div className="space-y-2">
                <h2 className="text-lg font-medium text-gray-800">
                  Welcome to SJIOC Car Lookup
                </h2>
                <p className="text-gray-600 text-sm max-w-xs mx-auto">
                  Enter any car number above to find the owner. 
                  We support all formats including spaces and symbols.
                </p>
              </div>

              {/* Feature highlights */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 text-left">
                <h3 className="font-medium text-gray-800 mb-2 text-center">✨ Features</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span>🔍</span>
                    <span>Smart search with typo tolerance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>🔒</span>
                    <span>Privacy-protected member information</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>📱</span>
                    <span>Works with any car number format</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Loading State */}
          {isSearching && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 180, 360]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  ease: 'easeInOut' 
                }}
                className="text-4xl mb-3"
              >
                🔍
              </motion.div>
              <div className="text-gray-600">Searching...</div>
            </motion.div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="text-center text-xs text-gray-500">
            <div>Made for SJIOC Community</div>
            <div className="mt-1">🔒 Secure • 🚀 Fast • 📱 Mobile-First</div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MobileApp;