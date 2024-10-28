import React from 'react';
import { mockAnimalPosts } from '../mock_data/animalPosts';
import styles from './ViewPost.module.css';

export default function ViewPost() {
    return (
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
    );
}