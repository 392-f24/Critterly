import {useEffect, useState} from "react";


const useGoogleMaps = (apiKey) => {
    const [isLoaded, setIsLoaded] = useState(false);
    useEffect(() => {
        const loadGoogleMaps = () => {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker`;
            script.async = true;
            script.defer = true;
            script.onload = () => setIsLoaded(true);
            script.onerror = () => setIsLoaded(false);
            document.head.appendChild(script);
        };

        if (!window.google) {
            loadGoogleMaps();
        } else {
            setIsLoaded(true); // Maps already loaded in window
        }

        return () => {
            if (window.google) {
                setIsLoaded(false); // Reset on unmount if needed
            }
        };
    }, [apiKey]);

    return isLoaded;
};

export default useGoogleMaps;