import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { productAPI } from '../services/api';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const response = await productAPI.searchSuggestions(query);
        // Extract suggestions array from response
        const suggestionsData = response.data?.suggestions || [];
        setSuggestions(suggestionsData);
        setShowSuggestions(suggestionsData.length > 0);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSearch = (searchQuery = query) => {
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
      setQuery('');
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  return (
    <div className="search-bar" ref={searchRef}>
      <input
        type="text"
        className="search-input"
        placeholder="Search products..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
      />
      <button className="search-btn" onClick={() => handleSearch()}>
        🔍
      </button>

      {showSuggestions && suggestions.length > 0 && (
        <div className="suggestions">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="suggestion-item"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;