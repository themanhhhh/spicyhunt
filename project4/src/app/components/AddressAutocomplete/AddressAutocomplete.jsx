"use client"

import React, { useState, useEffect, useRef } from 'react';
import styles from './AddressAutocomplete.module.css';
import { FaMapMarkerAlt, FaSpinner } from 'react-icons/fa';

const AddressAutocomplete = ({ 
  onAddressSelect, 
  placeholder = "Enter address...", 
  value = "",
  onChange,
  required = false 
}) => {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const debounceRef = useRef(null);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Debounced search function
  const searchAddresses = async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoading(true);
    try {
      // Using Nominatim API (OpenStreetMap) - completely free
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            'User-Agent': 'RestaurantApp/1.0' // Required by Nominatim
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        const formattedSuggestions = data.map(item => ({
          id: item.place_id,
          display_name: item.display_name,
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon),
          address: {
            house_number: item.address?.house_number || '',
            road: item.address?.road || '',
            city: item.address?.city || item.address?.town || item.address?.village || '',
            state: item.address?.state || '',
            postcode: item.address?.postcode || '',
            country: item.address?.country || ''
          },
          formatted_address: item.display_name
        }));
        
        setSuggestions(formattedSuggestions);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle input change with debouncing
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setQuery(newValue);
    setSelectedIndex(-1);
    
    if (onChange) {
      onChange(e);
    }

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new debounce
    debounceRef.current = setTimeout(() => {
      searchAddresses(newValue);
    }, 300);
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.display_name);
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedIndex(-1);
    
    if (onAddressSelect) {
      onAddressSelect({
        formatted_address: suggestion.display_name,
        latitude: suggestion.lat,
        longitude: suggestion.lon,
        address_components: {
          street_number: suggestion.address.house_number,
          route: suggestion.address.road,
          locality: suggestion.address.city,
          administrative_area_level_1: suggestion.address.state,
          postal_code: suggestion.address.postcode,
          country: suggestion.address.country
        },
        place_id: suggestion.id
      });
    }
  };

  // Handle keyboard navigation
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
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Update query when value prop changes
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className={styles.autocompleteContainer}>
      <div className={styles.inputContainer}>
        <FaMapMarkerAlt className={styles.inputIcon} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder={placeholder}
          required={required}
          className={styles.addressInput}
          autoComplete="off"
        />
        {loading && (
          <FaSpinner className={`${styles.loadingIcon} ${styles.spinning}`} />
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div ref={suggestionsRef} className={styles.suggestionsContainer}>
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.id}
              className={`${styles.suggestionItem} ${
                index === selectedIndex ? styles.selected : ''
              }`}
              onClick={() => handleSuggestionClick(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <FaMapMarkerAlt className={styles.suggestionIcon} />
              <div className={styles.suggestionContent}>
                <div className={styles.suggestionMain}>
                  {suggestion.address.road && suggestion.address.house_number
                    ? `${suggestion.address.house_number} ${suggestion.address.road}`
                    : suggestion.address.road || suggestion.display_name.split(',')[0]
                  }
                </div>
                <div className={styles.suggestionSecondary}>
                  {[
                    suggestion.address.city,
                    suggestion.address.state,
                    suggestion.address.country
                  ].filter(Boolean).join(', ')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showSuggestions && suggestions.length === 0 && !loading && query.length >= 3 && (
        <div ref={suggestionsRef} className={styles.suggestionsContainer}>
          <div className={styles.noResults}>
            No addresses found
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressAutocomplete; 