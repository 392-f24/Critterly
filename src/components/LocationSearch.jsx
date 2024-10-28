import React, { useState } from 'react';
import axios from 'axios';

const LocationSearch = () => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);

    const handleInputChange = async (e) => {
        const input = e.target.value;
        setQuery(input);

        if (input) {
            try {
                const response = await axios.get(
                    `https://critterly-fed57.cloudfunctions.net/getLocationSuggestions`,
                    {
                        params: { input },
                    }
                );
                setSuggestions(response.data); // Assume response.data is an array of suggestions
            } catch (error) {
                console.error('Error fetching location suggestions:', error);
            }
        } else {
            setSuggestions([]); // Clear suggestions if input is empty
        }
    };

    return (
        <div>
            <input 
                type="text" 
                value={query} 
                onChange={handleInputChange} 
                placeholder="Search for a location..."
            />
            {suggestions.length > 0 && (
                <ul>
                    {suggestions.map((location, index) => (
                        <li key={index}>{location}</li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default LocationSearch;
