import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader } from '@googlemaps/js-api-loader';
import Navigation from './Navigation';
import styles from './Map.module.css';

import orangeTabby from '../mock_data/orange-tabby.jpg';
import duck from '../mock_data/duck.jpg';
import pizzaSquirrel from '../mock_data/PizzaSquirrel.jpeg';

// Mock animal posts data
const mockAnimalPosts = [
    {
        id: 1,
        title: 'Friendly Campus Cat',
        description: 'Spotted this orange tabby cat near the library! Super friendly and loves pets.',
        photo: orangeTabby,
        address: '1970 Campus Drive, Evanston, IL 60208', // University Library
        date: new Date().toISOString()
    },
    {
        id: 2,
        title: 'Duck Family',
        description: 'A mother duck with ducklings near the rocks! So cute!',
        photo: duck,
        address: '1999 Campus Drive, Evanston, IL 60208', // Lakefill area
        date: new Date().toISOString()
    },
    {
        id: 3,
        title: 'Squirrel with Pizza',
        description: 'This ambitious squirrel is trying to carry an entire slice of pizza up a tree 😂',
        photo: pizzaSquirrel,
        address: '633 Clark St, Evanston, IL 60208', // The Rock area
        date: new Date().toISOString()
    }
];

export default function Map() {
    const navigate = useNavigate();
    const mapRef = React.useRef(null);
    const [mapLoaded, setMapLoaded] = React.useState(false);
    const [coordinates, setCoordinates] = React.useState(null);
    const [map, setMap] = React.useState(null);
    const [infoWindows, setInfoWindows] = React.useState([]);

    const Create_Post = () => {
        navigate('/create_post'); 
    };

    const View_Post = () => {
        navigate('/view_post'); 
    };

    // Function to create content for info windows
    const createInfoWindowContent = (post) => {
        return `
            <div style="width: 300px; padding: 10px;">
                <img src="${post.photo}" alt="${post.title}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 4px;">
                <h3 style="margin: 8px 0; color: #333;">${post.title}</h3>
                <p style="margin: 8px 0; color: #666;">${post.description}</p>
                <p style="margin: 4px 0; color: #888; font-size: 12px;">
                    Posted: ${new Date(post.date).toLocaleDateString()}
                </p>
            </div>
        `;
    };

    React.useEffect(() => {
        const loader = new Loader({
            apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
            version: "beta",
            libraries: ["maps", "marker", "geocoding"]
        });

        loader.load()
            .then((google) => {
                const geocoder = new google.maps.Geocoder();
                
                // Initialize the map
                const mapInstance = new google.maps.Map(mapRef.current, {
                    zoom: 15,
                    mapId: "DEMO_MAP_ID"
                });
                setMap(mapInstance);

                // Set center to Northwestern
                geocoder.geocode({
                    address: "633 Clark St, Evanston, IL 60208"
                }, (results, status) => {
                    if (status === "OK") {
                        const centerLocation = results[0].geometry.location;
                        mapInstance.setCenter(centerLocation);
                        setCoordinates({ 
                            lat: centerLocation.lat(), 
                            lng: centerLocation.lng() 
                        });

                        // Create markers and info windows for each post
                        mockAnimalPosts.forEach(post => {
                            geocoder.geocode({ address: post.address }, (results, status) => {
                                if (status === "OK") {
                                    const position = results[0].geometry.location;
                                    
                                    // Create marker
                                    const marker = new google.maps.Marker({
                                        position: position,
                                        map: mapInstance,
                                        title: post.title
                                    });

                                    // Create info window
                                    const infoWindow = new google.maps.InfoWindow({
                                        content: createInfoWindowContent(post),
                                        maxWidth: 320
                                    });

                                    // Add click listener to marker
                                    marker.addListener('click', () => {
                                        // Close all other info windows first
                                        infoWindows.forEach(iw => iw.close());
                                        infoWindow.open({
                                            anchor: marker,
                                            map: mapInstance
                                        });
                                    });

                                    // Store info window reference
                                    setInfoWindows(prev => [...prev, infoWindow]);
                                } else {
                                    console.error(`Geocoding failed for ${post.address}:`, status);
                                }
                            });
                        });
                    } else {
                        console.error("Geocoding failed:", status);
                        const fallbackCoords = { lat: 42.0565, lng: -87.6753 };
                        mapInstance.setCenter(fallbackCoords);
                        setCoordinates(fallbackCoords);
                    }
                });
                
                setMapLoaded(true);
            })
            .catch(e => {
                console.error('Error loading Google Maps:', e);
            });

        // Cleanup function
        return () => {
            infoWindows.forEach(infoWindow => infoWindow.close());
        };
    }, []);

    return (
        <div style={{ height: '100vh', width: '100%' }}>
            <Navigation />
            <div ref={mapRef} className={styles.mapContainer} style={{ position: 'relative', height: 'calc(100% - 60px)' }}>
                {mapLoaded && coordinates && (
                    <div id="map" style={{ width: '100%', height: '100%' }}></div>
                )}
            </div>
            <div style={{ 
                position: 'absolute', 
                bottom: '20px', 
                right: '20px', 
                zIndex: 1000,
                display: 'flex',
                gap: '12px'
            }}>
                <button 
                    onClick={Create_Post} 
                    style={{
                        backgroundColor: '#4A90E2',
                        color: 'white',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        transition: 'all 0.2s ease-in-out',
                        ':hover': {
                            backgroundColor: '#357ABD',
                            transform: 'translateY(-1px)',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }
                    }}
                >
                    <i className="fa-solid fa-plus" style={{ fontSize: '12px' }}></i>
                    Create Post
                </button>
                <button 
                    onClick={View_Post}
                    style={{
                        backgroundColor: '#6C757D',
                        color: 'white',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '14px',
                        fontWeight: '500',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        transition: 'all 0.2s ease-in-out',
                        ':hover': {
                            backgroundColor: '#5A6268',
                            transform: 'translateY(-1px)',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }
                    }}
                >
                    View Posts
                </button>
            </div>
        </div>
    );
}