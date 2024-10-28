import React, { useEffect, useRef, useState } from 'react';

const LocationInput = ({ onLocationSelect }) => {
  const [inputValue, setInputValue] = useState('');
  const autocompleteRef = useRef(null);

  useEffect(() => {
    const loadScript = (url) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject();
        document.body.appendChild(script);
      });
    };

    const initAutocomplete = () => {
      if (autocompleteRef.current && window.google) {
        const options = {
          types: ['geocode'],
        };

        const autoCompleteInstance = new window.google.maps.places.Autocomplete(autocompleteRef.current, options);

        autoCompleteInstance.addListener('place_changed', () => {
          const place = autoCompleteInstance.getPlace();
          setInputValue(place.formatted_address || '');
          onLocationSelect(place);
        });
      }
    };

    loadScript(`https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=geocode`)
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

