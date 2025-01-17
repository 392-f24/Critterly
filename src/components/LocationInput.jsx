import React, { useEffect, useRef, useState } from "react";

const LocationInput = ({ onLocationSelect }) => {
  const [inputValue, setInputValue] = useState('');
  const autocompleteRef = useRef(null);

  useEffect(() => {
    const loadScript = (url) => {
      return new Promise((resolve, reject) => {
        // Check if the script is already loaded
        if (document.querySelector(`script[src="${url}"]`)) {
          resolve(); // If it's already loaded, resolve immediately
          return;
        }

        const script = document.createElement('script');
        script.src = url;
        script.async = true; // Set async for optimal performance
        script.defer = true; // Also defer loading
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
        document.body.appendChild(script);
      });
    };

    const initAutocomplete = () => {
      if (autocompleteRef.current && window.google) {
        const options = {
          types: ['geocode'], // Specify address suggestions
        };

        const autoCompleteInstance = new window.google.maps.places.Autocomplete(autocompleteRef.current, options);

        autoCompleteInstance.addListener('place_changed', () => {
          const place = autoCompleteInstance.getPlace();
          setInputValue(place.formatted_address || '');
          onLocationSelect(place);
        });
      }
    };

    // Construct the API URL
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;

    loadScript(url)
      .then(() => {
        initAutocomplete();
      })
      .catch((error) => console.error('Error loading Google Maps API:', error));

  }, [onLocationSelect]);

  return (
    <input
      ref={autocompleteRef}
      type="text"
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      placeholder="Enter a location"
      style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
    />
  );
};

export default LocationInput;


