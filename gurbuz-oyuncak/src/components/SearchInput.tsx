import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { useSearch } from '../hooks/useSearch';
import { useAuth } from '../contexts/AuthContext';

interface SearchInputProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
  showSuggestions?: boolean;
  autoFocus?: boolean;
}

const SearchInput: React.FC<SearchInputProps> = ({
  onSearch,
  placeholder = "Ürün ara...",
  className = "",
  showSuggestions = true,
  autoFocus = false
}) => {
  const { user } = useAuth();
  const {
    query,
    setQuery,
    suggestions,
    fetchSuggestions,
    getPopularSearches,
    performSearch
  } = useSearch();

  const [isFocused, setIsFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [popularSearches, setPopularSearches] = useState<any[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get recent searches from localStorage
  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`recent_searches_${user.id}`);
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    }
  }, [user]);

  // Fetch popular searches on mount
  useEffect(() => {
    getPopularSearches().then(setPopularSearches).catch(() => {
      // Silently fail to avoid console spam
      setPopularSearches([]);
    });
  }, []); // Remove getPopularSearches dependency to prevent infinite loop

  // Handle input focus
  const handleFocus = () => {
    setIsFocused(true);
    setShowDropdown(true);
  };

  // Handle input blur with delay for dropdown click
  const handleBlur = () => {
    setTimeout(() => {
      setIsFocused(false);
      setShowDropdown(false);
    }, 200);
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    if (showSuggestions) {
      fetchSuggestions(value);
    }
  };

  // Handle search submission
  const handleSearch = (searchQuery: string = query) => {
    if (searchQuery.trim()) {
      // Save to recent searches
      if (user) {
        const updated = [
          searchQuery,
          ...recentSearches.filter(s => s !== searchQuery)
        ].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem(`recent_searches_${user.id}`, JSON.stringify(updated));
      }

      // Perform search
      performSearch(searchQuery, {});
      
      // Call onSearch callback
      if (onSearch) {
        onSearch(searchQuery);
      }

      setShowDropdown(false);
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    if (user) {
      localStorage.removeItem(`recent_searches_${user.id}`);
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showDropdown && showSuggestions && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
        >
          {/* Search suggestions */}
          {query && suggestions.length > 0 && (
            <div className="p-2">
              <div className="text-xs font-semibold text-gray-500 px-2 py-1">
                Öneriler
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion.term)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md flex items-center"
                >
                  <Search className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="flex-1">{suggestion.term}</span>
                  {suggestion.category && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {suggestion.category}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Recent searches */}
          {!query && recentSearches.length > 0 && (
            <div className="p-2">
              <div className="flex items-center justify-between px-2 py-1">
                <div className="text-xs font-semibold text-gray-500 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  Son Aramalar
                </div>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Temizle
                </button>
              </div>
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(search)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md flex items-center"
                >
                  <Clock className="w-4 h-4 text-gray-400 mr-2" />
                  {search}
                </button>
              ))}
            </div>
          )}

          {/* Popular searches */}
          {!query && popularSearches.length > 0 && (
            <div className="p-2 border-t border-gray-100">
              <div className="text-xs font-semibold text-gray-500 px-2 py-1 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                Popüler Aramalar
              </div>
              {popularSearches.slice(0, 5).map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(search.term)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md flex items-center"
                >
                  <TrendingUp className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="flex-1">{search.term}</span>
                  {search.search_count > 0 && (
                    <span className="text-xs text-gray-400">
                      {search.search_count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* No results */}
          {query && suggestions.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">"{query}" için sonuç bulunamadı</p>
              <p className="text-xs mt-1">Farklı bir terim deneyin</p>
            </div>
          )}

          {/* Search button */}
          {query && (
            <div className="p-2 border-t border-gray-100">
              <button
                onClick={() => handleSearch()}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <Search className="w-4 h-4 mr-2" />
                "{query}" için ara
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchInput;