import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader } from '@googlemaps/js-api-loader';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import Navigation from './Navigation';
import styles from './Map.module.css';
import { mockAnimalPosts } from '../mock_data/animalPosts';

export default function MapComponent() {  // Renamed from Map to MapComponent
    const navigate = useNavigate();
    const mapRef = React.useRef(null);
    const [mapLoaded, setMapLoaded] = React.useState(false);
    const [coordinates, setCoordinates] = React.useState(null);
    const [map, setMap] = React.useState(null);
    const [infoWindows, setInfoWindows] = React.useState([]);
    const [markers, setMarkers] = React.useState([]);
    const [markerClusterer, setMarkerClusterer] = React.useState(null);

    const Create_Post = () => {
        navigate('/create_post');
    };

    const View_Post = () => {
        navigate('/view_post');
    };

    const createSinglePostContent = (post) => {
        return `
            <div style="width: 250px;">
                <div style="width: 100%; max-height: 150px; display: flex; justify-content: center; align-items: center; overflow: hidden;">
                    <img src="${post.photo}" 
                        alt="${post.title}" 
                        style="max-width: 100%;
                               max-height: 150px;
                               object-fit: contain;
                               display: block;
                               margin: 0 auto;"
                    />
                </div>
                <div style="padding: 8px; width: 100%;">
                    <h3 style="margin: 6px 0; color: #333; font-size: 16px;">${post.title}</h3>
                    <p style="margin: 6px 0; color: #666; font-size: 14px;">${post.description}</p>
                    <p style="margin: 4px 0; color: #888; font-size: 12px;">
                        Posted: ${new Date(post.date).toLocaleDateString()}
                    </p>
                </div>
            </div>
        `;
    };

    const createMultiplePostsContent = (posts) => {
        return `
            <div style="width: 250px; max-height: 400px; overflow-y: auto;">
                ${posts.map((post, index) => `
                    <div style="
                        padding: 10px;
                        ${index !== 0 ? 'border-top: 1px solid #eee;' : ''}
                    ">
                        ${createSinglePostContent(post)}
                    </div>
                `).join('')}
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
            .then(async (google) => {
                const geocoder = new google.maps.Geocoder();
                
                const mapInstance = new google.maps.Map(mapRef.current, {
                    zoom: 15,
                    mapId: "DEMO_MAP_ID"
                });
                setMap(mapInstance);

                // Set center to Northwestern
                geocoder.geocode({
                    address: "633 Clark St, Evanston, IL 60208"
                }, async (results, status) => {
                    if (status === "OK") {
                        const centerLocation = results[0].geometry.location;
                        mapInstance.setCenter(centerLocation);
                        setCoordinates({ 
                            lat: centerLocation.lat(), 
                            lng: centerLocation.lng() 
                        });

                        // Create a location hash map (using an object instead of Map)
                        const locationHashMap = {};

                        // Geocode all posts and group them by location
                        for (const post of mockAnimalPosts) {
                            try {
                                const results = await new Promise((resolve, reject) => {
                                    geocoder.geocode({ address: post.address }, (results, status) => {
                                        if (status === "OK") {
                                            resolve(results);
                                        } else {
                                            reject(status);
                                        }
                                    });
                                });

                                const position = results[0].geometry.location;
                                const locationKey = `${position.lat()},${position.lng()}`;
                                
                                if (!locationHashMap[locationKey]) {
                                    locationHashMap[locationKey] = {
                                        position,
                                        posts: []
                                    };
                                }
                                locationHashMap[locationKey].posts.push(post);

                            } catch (error) {
                                console.error(`Geocoding failed for ${post.address}:`, error);
                            }
                        }

                        const markersArray = [];
                        const infoWindowsArray = [];

                        // Create markers for each unique location
                        Object.values(locationHashMap).forEach(({ position, posts }) => {
                            const marker = new google.maps.marker.AdvancedMarkerElement({
                                position: position,
                                map: mapInstance,
                                title: posts.length > 1 ? `${posts.length} posts at this location` : posts[0].title
                            });

                            const infoWindow = new google.maps.InfoWindow({
                                content: posts.length > 1 ? createMultiplePostsContent(posts) : createSinglePostContent(posts[0]),
                                maxWidth: 320
                            });

                            marker.addListener('click', () => {
                                infoWindowsArray.forEach(iw => iw.close());
                                infoWindow.open({
                                    anchor: marker,
                                    map: mapInstance
                                });
                            });

                            markersArray.push(marker);
                            infoWindowsArray.push(infoWindow);
                        });

                        setMarkers(markersArray);
                        setInfoWindows(infoWindowsArray);

                        // Initialize MarkerClusterer
                        const clusterer = new MarkerClusterer({
                            map: mapInstance,
                            markers: markersArray,
                            maxZoom: 15,
                            gridSize: 60,
                            minimumClusterSize: 2
                        });

                        setMarkerClusterer(clusterer);

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
            if (markerClusterer) {
                markerClusterer.clearMarkers();
            }
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