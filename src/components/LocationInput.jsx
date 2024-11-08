import React, { useEffect, useRef, useState } from "react";
import { useGoogleMapsContext } from "./GoogleMapAPI";

const LocationInput = ({ onLocationSelect }) => {
  const { isLoaded } = useGoogleMapsContext();
  
  const [inputValue, setInputValue] = useState('');
  const autocompleteRef = useRef(null);

  useEffect(() => {
    if (autocompleteRef.current && window.google) {
      const autoCompleteInstance = new window.google.maps.places.Autocomplete(autocompleteRef.current, {
        types: ['geocode'],
      });

      autoCompleteInstance.addListener('place_changed', () => {
        const place = autoCompleteInstance.getPlace();
        setInputValue(place.formatted_address || '');
        onLocationSelect(place);
      });
    }
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


