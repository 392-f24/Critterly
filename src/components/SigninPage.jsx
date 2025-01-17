import React, { useState, useEffect } from 'react';
import { auth, db } from '../utilities/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';


const SignInPage = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (!user) {
                navigate('/'); // Redirect to home if no authenticated user
            } else {
                // Set the email from the authenticated user
                setEmail(user.email);
            }
        });
    }, [navigate]);

    const handleCompleteSignIn = async () => {
        try {
            const user = auth.currentUser;

            if (!username) {
                setError('Username is required.');
                return;
            }

            const userDocRef = doc(db, 'users', user.uid);
            await setDoc(userDocRef, {
                uid: user.uid,
                username,
                email,  // This will still be included in the database
                biography: '',
                createdAt: new Date(),
                posts: 0,
                profilePicture: '',
            });

            navigate('/');
        } catch (err) {
            setError(`Error completing sign-in: ${err.message}`);
        }
    };

    return (
        <div style={styles.signInContainer}>
            <h2>Complete Your Profile</h2>
            {error && <p style={styles.errorText}>{error}</p>}
            
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={styles.input}
            />
            
            <button onClick={handleCompleteSignIn} style={styles.signInButton}>
                Complete Sign In
            </button>
        </div>
    );
};

// Define styles object
const styles = {
    signInContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
    },
    errorText: {
        color: 'red',
        marginBottom: '10px',
    },
    input: {
        marginBottom: '10px',
        padding: '8px',
        width: '100%',
        maxWidth: '300px',
        borderRadius: '4px',
        border: '1px solid #ccc',
    },
    signInButton: {
        backgroundColor: '#87A96B',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '8px',
        cursor: 'pointer',
    },
};

export default SignInPage;