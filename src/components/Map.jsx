import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { db } from '../utilities/firebase';
import { collection, getDocs } from 'firebase/firestore';
import Navigation from './Navigation';
import styles from './Map.module.css';
import GoogleMapsLoader from '../utilities/googleMapsLoader';

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

    const createWildlifeContent = (characterization) => {
        if (!characterization) return '';

        const renderRarityStars = (rarity) => {
            return [...Array(rarity)].map(() => 
                `<span style="color: #ffd700; margin-right: 2px;">★</span>`
            ).join('');
        };

        const renderThreatLevel = (level) => {
            return [...Array(level)].map(() => 
                `<span style="color: #ff4444; margin-right: 2px;">☠️</span>`
            ).join('');
        };

        return `
            <div style="
                padding: 16px;
                background-color: #ffffff;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                margin-top: 16px;
            ">
                <div style="
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 16px;
                ">
                    <span style="color: #28a745; font-size: 24px;">🌿</span>
                    <h3 style="
                        margin: 0;
                        font-size: 20px;
                        font-weight: 600;
                        color: #2c3e50;
                    ">${characterization.Species}</h3>
                </div>

                <div style="
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 16px;
                    margin-bottom: 16px;
                ">
                    <div>
                        <span style="font-size: 14px; color: #666; font-weight: 500;">Class:</span>
                        <span style="font-size: 16px; color: #2c3e50; display: block;">${characterization.Class}</span>
                    </div>

                    <div>
                        <span style="font-size: 14px; color: #666; font-weight: 500;">Diet:</span>
                        <span style="font-size: 16px; color: #2c3e50; display: block;">${characterization.Diet}</span>
                    </div>

                    <div>
                        <span style="font-size: 14px; color: #666; font-weight: 500;">Rarity:</span>
                        <div>${renderRarityStars(characterization.Rarity)}</div>
                    </div>

                    <div>
                        <span style="font-size: 14px; color: #666; font-weight: 500;">Threat Level:</span>
                        <div>${renderThreatLevel(characterization.ThreatLevel)}</div>
                    </div>
                </div>

                <div style="
                    margin-bottom: 16px;
                    padding: 12px;
                    background-color: #f8f9fa;
                    border-radius: 4px;
                ">
                    <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #2c3e50;">
                        ${characterization.Description}
                    </p>
                </div>

                <div style="
                    padding: 12px;
                    background-color: #e3f2fd;
                    border-radius: 4px;
                ">
                    <span style="
                        display: block;
                        font-size: 14px;
                        font-weight: 500;
                        color: #1976d2;
                        margin-bottom: 4px;
                    ">Fun Fact:</span>
                    <p style="margin: 0; font-size: 14px; color: #2c3e50;">
                        ${characterization.FunFact}
                    </p>
                </div>
            </div>
        `;
    };

    const createSinglePostContent = (post) => {
        const date = post.createdAt ? new Date(post.createdAt.toDate()).toLocaleDateString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric"
        }) : "Date not available";
    
        return `
            <div style="
                width: 280px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                overflow: hidden;
                margin: 10px;
            ">
                <!-- User Profile Section -->
                <div style="
                    display: flex;
                    align-items: center;
                    padding: 12px;
                    border-bottom: 1px solid #eee;
                    background-color: #f8f9fa;
                ">
                    <div style="
                        width: 32px;
                        height: 32px;
                        border-radius: 50%;
                        background-color: #e0e0e0;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin-right: 12px;
                    ">
                        <span style="color: #666;">👤</span>
                    </div>
                    <div style="flex-grow: 1;">
                        <div style="font-weight: 500; color: #333;">
                            ${post.userName || 'Anonymous User'}
                        </div>
                        <div style="font-size: 12px; color: #666;">
                            ${date}
                        </div>
                    </div>
                    <button onclick="alert('View Profile')" style="
                        padding: 6px 12px;
                        background-color: #4A90E2;
                        color: white;
                        border: none;
                        border-radius: 6px;
                        font-size: 12px;
                        cursor: pointer;
                        transition: background-color 0.2s;
                    ">
                        Profile
                    </button>
                </div>
    
                <!-- Image Container -->
                <div style="
                    width: 100%;
                    height: 180px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    background-color: #f8f9fa;
                    overflow: hidden;
                ">
                    <img src="${post.imageUrl}" 
                        alt="${post.caption || 'Post image'}" 
                        style="
                            width: 100%;
                            height: 100%;
                            object-fit: cover;
                        "
                        onerror="this.onerror=null; this.src='https://via.placeholder.com/150?text=Image+Not+Found';"
                    />
                </div>
    
                <!-- Caption Container -->
                <div style="
                    padding: 12px;
                    background-color: white;
                ">
                    <p style="
                        margin: 0;
                        color: #333;
                        font-size: 14px;
                        line-height: 1.4;
                    ">
                        ${post.caption || 'No caption'}
                    </p>
                </div>
    
                ${post.characterization ? createWildlifeContent(post.characterization) : ''}
            </div>
        `;
    };
    
    const createMultiplePostsContent = (posts) => {
        return `
            <div style="
                width: 320px;
                max-height: 80vh;
                overflow-y: auto;
                background: white;
                border-radius: 12px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                padding: 10px;
            ">
                ${posts.map((post, index) => `
                    <div style="
                        ${index !== 0 ? 'margin-top: 20px;' : ''}
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

        GoogleMapsLoader.load()
            .then(async (google) => {
                const geocoder = new google.maps.Geocoder();
                
                const mapInstance = new google.maps.Map(mapRef.current, {
                    zoom: 15,
                    mapId: "DEMO_MAP_ID",
                    disableDefaultUI: true,
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