import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../utilities/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function Post({ postData }) {
    const navigate = useNavigate();
    const [username, setUsername] = useState('Anonymous User');

    useEffect(() => {
        const fetchUsername = async () => {
            if (postData?.userId) {
                try {
                    const userDoc = await getDoc(doc(db, 'users', postData.userId));
                    if (userDoc.exists()) {
                        setUsername(userDoc.data().username || 'Anonymous User');
                    }
                } catch (error) {
                    console.error("Error fetching username:", error);
                    setUsername('Anonymous User');
                }
            }
        };

        fetchUsername();
    }, [postData?.userId]);

    if (!postData) return null;

    const renderRarityStars = (rarity) => {
        return [...Array(rarity)].map((_, index) => (
            <span key={index} style={{ color: '#ffd700', marginRight: '2px' }}>★</span>
        ));
    };

    const renderThreatLevel = (level) => {
        return [...Array(level)].map((_, index) => (
            <span key={index} style={{ color: '#ff4444', marginRight: '2px' }}>☠️</span>
        ));
    };

    const date = postData.createdAt ? 
        new Date(postData.createdAt.toDate()).toLocaleDateString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric"
        }) : "Date not available";

    const handleMapNavigation = () => {
        navigate(`/?postLocation=${encodeURIComponent(postData.geotag)}&postId=${postData.id}`);
    };

    const handleProfileNavigation = () => {
        navigate(`/profile/${postData.userId}`);
    };

    return (
        <div style={{
            width: '100%',
            maxWidth: '800px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
            margin: '20px auto'
        }}>
            {/* User Profile Section */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px',
                borderBottom: '1px solid #eee',
                backgroundColor: '#f8f9fa'
            }}>
                <div 
                    onClick={handleProfileNavigation}
                    style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: '#e0e0e0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '12px',
                        cursor: 'pointer'
                    }}
                >
                    <span style={{ color: '#666' }}>👤</span>
                </div>
                <div style={{ flexGrow: 1 }}>
                    <div 
                        onClick={handleProfileNavigation}
                        style={{ 
                            fontWeight: 500, 
                            color: '#333',
                            cursor: 'pointer'
                        }}
                    >
                        {username}
                    </div>
                    <div style={{ 
                        fontSize: '12px', 
                        color: '#666',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <span>{date}</span>
                        {postData.geotag && (
                            <span style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '4px',
                                color: '#28a745'
                            }}>
                                📍 {postData.geotag}
                            </span>
                        )}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {postData.geotag && (
                        <button 
                            onClick={handleMapNavigation}
                            style={{
                                padding: '6px 12px',
                                backgroundColor: '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '12px',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}
                        >
                            🗺️ View on Map
                        </button>
                    )}
                    <button 
                        onClick={handleProfileNavigation}
                        style={{
                            padding: '6px 12px',
                            backgroundColor: '#4A90E2',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                        }}
                    >
                        View Profile
                    </button>
                </div>
            </div>

            {/* Image Container */}
            <div style={{
                width: '100%',
                height: '400px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#f8f9fa',
                overflow: 'hidden'
            }}>
                <img 
                    src={postData.imageUrl} 
                    alt={postData.caption || 'Post image'} 
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain'
                    }}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/150?text=Image+Not+Found';
                    }}
                />
            </div>

            {/* Caption Container */}
            <div style={{
                padding: '12px',
                backgroundColor: 'white'
            }}>
                <p style={{
                    margin: 0,
                    color: '#333',
                    fontSize: '18px',
                    lineHeight: 1.4
                }}>
                    {postData.caption || 'No caption'}
                </p>
            </div>

            {/* Wildlife Information */}
            {postData.characterization && (
                <div style={{
                    padding: '16px',
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    marginTop: '16px'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '16px'
                    }}>
                        <span style={{ color: '#28a745', fontSize: '24px' }}>🌿</span>
                        <h3 style={{
                            margin: 0,
                            fontSize: '20px',
                            fontWeight: 600,
                            color: '#2c3e50'
                        }}>{postData.characterization.Species}</h3>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '16px',
                        marginBottom: '16px'
                    }}>
                        <div>
                            <span style={{ fontSize: '14px', color: '#666', fontWeight: 500 }}>Class:</span>
                            <span style={{ fontSize: '16px', color: '#2c3e50', display: 'block' }}>
                                {postData.characterization.Class}
                            </span>
                        </div>

                        <div>
                            <span style={{ fontSize: '14px', color: '#666', fontWeight: 500 }}>Diet:</span>
                            <span style={{ fontSize: '16px', color: '#2c3e50', display: 'block' }}>
                                {postData.characterization.Diet}
                            </span>
                        </div>

                        <div>
                            <span style={{ fontSize: '14px', color: '#666', fontWeight: 500 }}>Rarity:</span>
                            <div>{renderRarityStars(postData.characterization.Rarity)}</div>
                        </div>

                        <div>
                            <span style={{ fontSize: '14px', color: '#666', fontWeight: 500 }}>Threat Level:</span>
                            <div>{renderThreatLevel(postData.characterization.ThreatLevel)}</div>
                        </div>
                    </div>

                    <div style={{
                        marginBottom: '16px',
                        padding: '12px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '4px'
                    }}>
                        <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5, color: '#2c3e50' }}>
                            {postData.characterization.Description}
                        </p>
                    </div>

                    <div style={{
                        padding: '12px',
                        backgroundColor: '#e3f2fd',
                        borderRadius: '4px'
                    }}>
                        <span style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: 500,
                            color: '#1976d2',
                            marginBottom: '4px'
                        }}>Fun Fact:</span>
                        <p style={{ margin: 0, fontSize: '14px', color: '#2c3e50' }}>
                            {postData.characterization.FunFact}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}