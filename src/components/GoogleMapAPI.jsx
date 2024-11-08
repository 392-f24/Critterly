import useGoogleMaps from "../utilities/useGoogleMaps";
import { createContext, useContext } from 'react';

// Create a Context for Google Maps API loading state
const GoogleMapsContext = createContext();

export const useGoogleMapsContext = () => useContext(GoogleMapsContext);

// Create a provider component to manage the loading state of Google Maps
export const GoogleMapsProvider = ({ children }) => {
    const isLoaded = useGoogleMaps(import.meta.env.VITE_GOOGLE_MAPS_API_KEY);

    return (
        <GoogleMapsContext.Provider value={{ isLoaded }}>
            {children}
        </GoogleMapsContext.Provider>
    );
};