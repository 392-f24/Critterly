import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader } from '@googlemaps/js-api-loader';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { db } from '../utilities/firebase';
import { collection, getDocs } from 'firebase/firestore';
import Navigation from './Navigation';
import styles from './Map.module.css';

export default function MapComponent() {
    const navigate = useNavigate();
    const mapRef = React.useRef(null);
    const [mapLoaded, setMapLoaded] = React.useState(false);
    const [coordinates, setCoordinates] = React.useState(null);
    const [map, setMap] = React.useState(null);
    const [infoWindows, setInfoWindows] = React.useState([]);
    const [markers, setMarkers] = React.useState([]);
    const [markerClusterer, setMarkerClusterer] = React.useState(null);
    const [posts, setPosts] = React.useState([]);

    const Create_Post = () => {
        navigate('/create_post');
    };

    const View_Post = () => {
        navigate('/view_post');
    };

    const createSinglePostContent = (post) => {
        const date = post.createdAt ? new Date(post.createdAt.toDate()).toLocaleDateString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric"
        }) : "Date not available";

        return `
            <div style="width: 250px; display: flex; flex-direction: column; align-items: center;">
                <div style="width: 100%; max-height: 150px; display: flex; justify-content: center; align-items: center; overflow: hidden; margin-bottom: 8px;">
                    <img src="${post.imageUrl}" 
                        alt="${post.caption || 'Post image'}" 
                        style="max-width: 100%;
                               max-height: 150px;
                               object-fit: contain;
                               display: block;
                               margin: 0 auto;"
                        onerror="this.onerror=null; this.src='https://via.placeholder.com/150?text=Image+Not+Found';"
                    />
                </div>
                <div style="padding: 8px; width: 100%;">
                    <h3 style="margin: 6px 0; color: #333; font-size: 16px;">${post.caption || 'No caption'}</h3>
                    <p style="margin: 4px 0; color: #888; font-size: 12px;">
                        Posted: ${date}
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
        const fetchPosts = async () => {
            try {
                const postsCollection = collection(db, 'posts');
                const postSnapshot = await getDocs(postsCollection);
                const postData = postSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setPosts(postData);
            } catch (error) {
                console.error("Error fetching posts:", error);
            }
        };
        fetchPosts();
    }, []);

    React.useEffect(() => {
        if (posts.length === 0) return;

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

                        // Create a location hash map
                        const locationHashMap = {};

                        // Geocode all posts and group them by location
                        for (const post of posts) {
                            try {
                                const results = await new Promise((resolve, reject) => {
                                    geocoder.geocode({ address: post.geotag }, (results, status) => {
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
                                console.error(`Geocoding failed for ${post.geotag}:`, error);
                            }
                        }

                        const markersArray = [];
                        const infoWindowsArray = [];

                        // Create markers for each unique location
                        Object.values(locationHashMap).forEach(({ position, posts }) => {
                            const marker = new google.maps.marker.AdvancedMarkerElement({
                                position: position,
                                map: mapInstance,
                                title: posts.length > 1 ? `${posts.length} posts at this location` : posts[0].caption
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
    }, [posts]);

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