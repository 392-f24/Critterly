import React from 'react';
import { useNavigate } from 'react-router-dom';
import { mockAnimalPosts } from '../mock_data/animalPosts';
import styles from './ViewPost.module.css';

export default function ViewPost() {
    const navigate = useNavigate();

    const Go_To_Map = () => {
        navigate('/');
    };

    return (
        <div>
            <div className={styles.postContainer}>
                {mockAnimalPosts.map(post => (
                    <div key={post.id} className={styles.post}>
                        <img src={post.photo} alt={post.title} className={styles.postImage} />
                        <div className={styles.postDetails}>
                            <h2 className={styles.postTitle}>{post.title}</h2>
                            <p className={styles.postDescription}>{post.description}</p>
                            <p className={styles.postLocation}>Location: {post.address}</p>
                            <p className={styles.postDate}>
                                Posted: {new Date(post.date).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
            <div style={{ 
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                zIndex: 1000
            }}>
                <button 
                    onClick={Go_To_Map}
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
                        transition: 'all 0.2s ease-in-out'
                    }}
                >
                    <i className="fa-solid fa-map-location-dot" style={{ fontSize: '12px' }}></i>
                    Map
                </button>
            </div>
        </div>
    );
}