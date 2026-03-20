import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import API from '../../services/api';

const LocationSearch = ({ id, value, onChange, onSelect, placeholder = "Where to?", unstyled = false }) => {
  const [suggestions, setSuggestions] = useState(['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Pune', 'Jaipur', 'Lucknow', 'Goa', 'Udaipur', 'Shimla', 'Manali', 'Kerala']);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const searchTimeout = useRef(null);

  // Fetch local hotel locations initially
  useEffect(() => {
    const fetchLocalLocations = async () => {
      try {
        const { data } = await API.get('/api/hotels/locations');
        if (data.data && data.data.length > 0) {
          setSuggestions([...new Set([...data.data, ...suggestions])]);
        }
      } catch (error) {
        console.error('Failed to fetch local locations:', error);
      }
    };
    fetchLocalLocations();
  }, []);

  // Use Nominatim API for searching all locations in India
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (value.trim().length > 1) {
      setLoading(true);
      searchTimeout.current = setTimeout(async () => {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&countrycodes=in&addressdetails=1&limit=8`
          );
          const data = await response.json();
          
          const results = data.map(item => ({
            name: item.address.city || item.address.town || item.address.suburb || item.address.village || item.display_name.split(',')[0],
            state: item.address.state || 'India',
            fullName: item.display_name
          }));

          // Filter out duplicates and set suggestions
          const uniqueResults = [];
          const seen = new Set();
          results.forEach(res => {
            if (!seen.has(res.name)) {
              seen.add(res.name);
              uniqueResults.push(res);
            }
          });

          setFilteredSuggestions(uniqueResults);
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setLoading(false);
        }
      }, 500); // Debounce
    } else {
      // Show default popular cities when input is empty or too short
      const defaults = suggestions.map(city => ({ name: city, state: 'India', fullName: `${city}, India` }));
      setFilteredSuggestions(defaults);
      setLoading(false);
    }

    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [value, suggestions]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (city) => {
    if (onSelect) {
      onSelect(city);
    } else {
      onChange(city.name);
    }
    setShowDropdown(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {!unstyled && <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />}
      <input 
        id={id}
        type="text" 
        placeholder={placeholder}
        className={unstyled 
          ? "w-full bg-transparent border-none focus:outline-none text-dark font-bold placeholder:text-gray-300 text-lg py-1"
          : "w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary outline-none text-dark font-bold transition-all"
        }
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={() => setShowDropdown(true)}
        onClick={() => setShowDropdown(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            // If there's a selected suggestion in a list, we could select it.
            // For now, let's just trigger selection of the current input if it's not empty
            if (value.trim()) {
              handleSelect({ name: value.trim(), state: 'India', fullName: `${value.trim()}, India` });
            }
          }
        }}
        autoComplete="off"
      />
      {loading && (
        <Loader2 className={`absolute ${unstyled ? 'right-0' : 'right-4'} top-1/2 -translate-y-1/2 text-primary w-4 h-4 animate-spin`} />
      )}
      
      {showDropdown && filteredSuggestions.length > 0 && (
        <div className={`absolute z-[1000] top-full mt-1 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden max-h-[300px] overflow-y-auto ${unstyled ? '-left-4 -right-4' : 'w-full min-w-[280px] left-0 shadow-2xl-soft'}`}>
          <div className="px-5 py-3 bg-gray-50/50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest flex justify-between">
            <span>{value.length > 1 ? 'Search Results' : 'Suggested Locations'}</span>
            <span className="text-primary/60">India</span>
          </div>
          {filteredSuggestions.map((city, index) => (
            <div 
              key={index}
              className="px-6 py-4 hover:bg-primary/5 cursor-pointer flex items-center transition-all border-b last:border-none border-gray-50 group pointer-events-auto"
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(city);
              }}
            >
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center mr-4 group-hover:bg-primary/10 transition-colors">
                <MapPin className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
              </div>
              <div className="flex flex-col">
                <span className="text-dark font-black tracking-tight">{city.name}</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter truncate w-48">
                  {city.fullName}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationSearch;
