import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { Search, MapPin, History, X, Loader2 } from 'lucide-react';

const AdvancedSearchBar = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  
  const wrapperRef = useRef(null);
  const navigate = useNavigate();

  // Load recent searches on mount
  useEffect(() => {
    const saved = localStorage.getItem('recentHotelSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced API call for suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!query.trim()) {
        setSuggestions([]);
        return;
      }
      setLoading(true);
      try {
        const { data } = await API.get(`/api/search/hotels?location=${query}&limit=5`);
        setSuggestions(data.data);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchSuggestions();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSearch = (searchTerm) => {
    if (!searchTerm.trim()) return;

    // Save to recent searches
    let updatedSearches = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5);
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentHotelSearches', JSON.stringify(updatedSearches));

    setIsFocused(false);
    navigate(`/destinations?city=${encodeURIComponent(searchTerm)}`);
  };

  const removeRecentSearch = (e, term) => {
    e.stopPropagation();
    const updated = recentSearches.filter(s => s !== term);
    setRecentSearches(updated);
    localStorage.setItem('recentHotelSearches', JSON.stringify(updated));
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto" ref={wrapperRef}>
      <div className="relative flex items-center w-full h-14 rounded-2xl focus-within:shadow-lg bg-white overflow-hidden border border-gray-200 transition-shadow">
        <div className="grid place-items-center h-full w-12 text-gray-400">
          <Search className="w-5 h-5" />
        </div>

        <input
          className="peer h-full w-full outline-none text-sm text-gray-700 pr-2 bg-transparent"
          type="text"
          id="search"
          placeholder="Where are you going?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
        />
        
        {query && (
          <button 
            onClick={() => setQuery('')}
            className="grid place-items-center h-full w-12 text-gray-400 hover:text-gray-600 outline-none"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        
        <button 
          onClick={() => handleSearch(query)}
          className="bg-primary hover:bg-primary-dark text-white px-6 h-full font-bold text-sm transition-colors"
        >
          Search
        </button>
      </div>

      {/* Dropdown Results */}
      {isFocused && (query.trim() || recentSearches.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 py-2 animate-fade-in-up">
          
          {loading && (
            <div className="p-4 flex justify-center items-center text-primary">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          )}

          {!loading && query.trim() && suggestions.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Top Results</div>
              {suggestions.map((hotel) => (
                <div 
                  key={hotel._id} 
                  onClick={() => handleSearch(hotel.location.city)}
                  className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mr-3 text-primary flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-dark text-sm">{hotel.name}</div>
                    <div className="text-xs text-gray-500">{hotel.location.city}, {hotel.location.state}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && query.trim() && suggestions.length === 0 && (
            <div className="p-4 flex flex-col items-center justify-center text-gray-500">
               <Search className="w-8 h-8 mb-2 text-gray-300" />
               <p className="text-sm">No exact matches for "{query}"</p>
               <p className="text-xs mt-1">Try searching broadly by city name.</p>
            </div>
          )}

          {!query.trim() && recentSearches.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Recent Searches</div>
              {recentSearches.map((term, index) => (
                <div 
                  key={index} 
                  onClick={() => { setQuery(term); handleSearch(term); }}
                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center text-gray-600">
                    <History className="w-4 h-4 mr-3 text-gray-400" />
                    <span className="text-sm font-medium">{term}</span>
                  </div>
                  <button 
                    onClick={(e) => removeRecentSearch(e, term)}
                    className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedSearchBar;
