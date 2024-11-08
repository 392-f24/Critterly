import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../utilities/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
//import { mockAnimalPosts } from '../mock_data/animalPosts';
import styles from './ViewPost.module.css';
import Post from './Post';

export default function ViewPost() {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);

    // fetch post info on load
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const postsCollection = collection(db, 'posts');
                const postSnapshot = await getDocs(postsCollection);
                const postData = postSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                // const userIds = [...new Set(postData.map(post => post.userId))];
                // const userPromises = userIds.map(async (userId) => {
                //    const userDoc = await getDoc(doc(db, 'users', userId));
                //    return {userId, ...userDoc.data() }});

                // const users = await Promise.all(userPromises);
                // const userMap = Object.fromEntries(users.map((user) => [user.userId, user]));

                // const postsANDuserData = postData.map(post => ({
                //    ...post,
                //    userName: usersMap[post.userId]?.name || 'Unknown User'}));
                
                // setPosts(postsANDuserData);
                setPosts(postData);
            }
            catch(error) {
                console.error("Error fetching posts from firestore:", error);
            }
        };
        fetchPosts();
    }, []);

    const Go_To_Map = () => {
        navigate('/');
    };

    // TO DO: fix display to show more than just image and caption
    // add description and other elements to table
    // fetch user name from userid
    return (
        <div>
            <div className={styles.postContainer}>
                {posts.map(post => (
                    <Post key={post.id} postData={post} />
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