import React from 'react';
import { FaStar, FaSkull } from 'react-icons/fa';
import { BiLeaf } from 'react-icons/bi';

export default function Post({ postData }) {
    if (!postData) return null;

    const renderRarityStars = (rarity) => (
        [...Array(rarity)].map((_, index) => (
          <FaStar key={index} style={{ color: '#ffd700', marginRight: '2px' }} />
        ))
    );
    
    const renderThreatLevel = (level) => (
        [...Array(level)].map((_, index) => (
            <FaSkull key={index} style={{ color: '#ff4444', marginRight: '2px' }} />
        ))
    );

    return (
        <div style={styles.post}>
            <div style={styles.contentContainer}>
            <div style={styles.imageContainer}>
                <img 
                    src={postData.imageUrl} 
                    alt={postData.caption} 
                    style={styles.postImage} 
                />
            </div>
            <div style={styles.postDetails}>
                <div style={styles.wildlifeContainer}>
                    <div style={styles.header}>
                        <BiLeaf style={{ color: '#28a745', fontSize: '24px' }} />
                        <h3 style={styles.title}>{postData.characterization.Species}</h3>
                    </div>

                    <div style={styles.infoGrid}>
                        <div style={styles.infoSection}>
                            <span style={styles.label}>Class:</span>
                            <span style={styles.value}>{postData.characterization.Class}</span>
                        </div>

                        <div style={styles.infoSection}>
                            <span style={styles.label}>Diet:</span>
                            <span style={styles.value}>{postData.characterization.Diet}</span>
                        </div>

                        <div style={styles.infoSection}>
                            <span style={styles.label}>Rarity:</span>
                            <div style={styles.iconContainer}>
                                {renderRarityStars(postData.characterization.Rarity)}
                            </div>
                        </div>

                        <div style={styles.infoSection}>
                            <span style={styles.label}>Threat Level:</span>
                            <div style={styles.iconContainer}>
                                {renderThreatLevel(postData.characterization.ThreatLevel)}
                            </div>
                        </div>
                    </div>

                    <div style={styles.description}>
                        <p style={styles.descriptionText}>{postData.characterization.Description}</p>
                    </div>

                    <div style={styles.funFact}>
                        <span style={styles.funFactLabel}>Fun Fact:</span>
                        <p style={styles.funFactText}>{postData.characterization.FunFact}</p>
                    </div>

                </div>
                <h3 style={styles.postTitle}>{postData.caption}</h3>
                <p style={styles.postLocation}>Location: {postData.geotag}</p>
                <p style={styles.postDate}>
                    Posted: {
                        postData.createdAt ?
                        new Date(postData.createdAt.toDate()).toLocaleDateString("en-US", {
                            month: "2-digit",
                            day: "2-digit",
                            year: "numeric"
                        })
                        : "Date not available"
                    }
                </p>
            </div>
            </div>
        </div>
    );
}

const styles = {
    post: {
        width: '100%',
        maxWidth: '800px',
        margin: '20px auto',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        overflow: 'hidden',
    },
    contentContainer: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center', // Centers the content horizontally
    },
    imageContainer: {
        width: '100%',
        height: '300px',
        overflow: 'hidden',
        backgroundColor: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    postImage: {
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        backgroundColor: '#f5f5f5',
    },
    postDetails: {
        width: '100%', // Takes full width of container
        padding: '20px',
        boxSizing: 'border-box', // Ensures padding doesn't add to width
    },
    wildlifeContainer: {
        width: '100%',
        padding: '16px',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '20px',
        boxSizing: 'border-box',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '16px',
    },
    title: {
        margin: 0,
        fontSize: '20px',
        fontWeight: '600',
        color: '#2c3e50',
    },
    infoGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '16px',
        marginBottom: '16px',
        width: '100%',
    },
    infoSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    },
    label: {
        fontSize: '14px',
        color: '#666',
        fontWeight: '500',
    },
    value: {
        fontSize: '16px',
        color: '#2c3e50',
    },
    iconContainer: {
        display: 'flex',
        alignItems: 'center',
    },
    description: {
        width: '100%',
        marginBottom: '16px',
        padding: '12px',
        backgroundColor: '#f8f9fa',
        borderRadius: '4px',
        boxSizing: 'border-box',
    },
    descriptionText: {
        margin: 0,
        fontSize: '14px',
        lineHeight: '1.5',
        color: '#2c3e50',
    },
    funFact: {
        width: '100%',
        padding: '12px',
        backgroundColor: '#e3f2fd',
        borderRadius: '4px',
        marginBottom: '16px',
        boxSizing: 'border-box',
    },
    funFactLabel: {
        display: 'block',
        fontSize: '14px',
        fontWeight: '500',
        color: '#1976d2',
        marginBottom: '4px',
    },
    funFactText: {
        margin: 0,
        fontSize: '14px',
        color: '#2c3e50',
    },
    tags: {
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
        width: '100%',
    },
    tag: {
        padding: '4px 12px',
        backgroundColor: '#e8f5e9',
        color: '#2e7d32',
        borderRadius: '16px',
        fontSize: '12px',
        fontWeight: '500',
    },
    postTitle: {
        width: '100%',
        fontSize: '24px',
        fontWeight: '600',
        color: '#333',
        margin: '0 0 10px 0',
    },
    postLocation: {
        width: '100%',
        fontSize: '14px',
        color: '#888',
        margin: '0 0 5px 0',
    },
    postDate: {
        width: '100%',
        fontSize: '14px',
        color: '#888',
        margin: '0',
    },
};