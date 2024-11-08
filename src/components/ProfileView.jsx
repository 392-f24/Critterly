import React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // For navigation
import { storage, db, useAuthState } from "../utilities/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, getDocs, query, where, doc, getDoc, setDoc } from 'firebase/firestore';


import profilePic from '../mock_data/Default_Profile.png';

const ProfilePage = () => {
  const [userData, setUserData] = useState([]);

  useEffect(() => {
    const fetchUser = async () => {
        try {
          const q = query(collection(db, "users"), where("uuid", "==", "1234567"));
          const querySnapshot = await getDocs(q);

          if (querySnapshot.empty) {
            console.log("No such document!");
              return;
          }
          else {
            console.log("Successful query");

            const data = querySnapshot.docs[0].data();

            const user = {
              profilePicture: data["Profile Picture"] || profilePic,    
              username: data.Username || "Default Name",
              email: data.Email || "default@example.com",
              biography: data.Biography || "",
              posts: data.Posts || 0,
              locationsVisited: Array.isArray(data.Locations) ? data.Locations.length : 0,
              speciesSpotted: Array.isArray(data.Species) ? data.Species.length : 0
            };

            console.log("User data:", user);
            setUserData(user);
            return;
            }
        }
        catch(error) {
          console.error("Error fetching posts from firestore:", error);
        }
    };
    fetchUser();
}, []);

  const handleSignOut = () => {
    // Sign-out logic here
    console.log('Signed out');
  };

  // State to manage if the image is expanded
  const [isExpanded, setIsExpanded] = useState(false);

  // Toggle the expanded view
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div style={styles.profile}>

      {/* Profile Picture */}
      <div style={styles.profilePictureContainer}>
        <img
          src={userData.profilePicture} // Replace with your image source
          alt="Profile"
          style={styles.profilePicture}
          onClick={toggleExpanded} // Click to expand
        />
      </div>

      {/* Expanded View */}
      {isExpanded && (
        <div style={styles.overlay} onClick={toggleExpanded}>
          <div style={styles.expandedImageContainer}>
            <img
              src={userData.profilePicture} // Same image source
              alt="Profile Expanded"
              style={styles.expandedImage}
            />
            <button style={styles.closeButton} onClick={toggleExpanded}>
              &times;
            </button>
          </div>
        </div>
      )}



      <h2 style={styles.username}>{userData.username}</h2>
      <p style={styles.email}>{userData.email}</p>
      <p style={styles.biography}>{userData.biography}</p>
      
      <div style={styles.statsContainer}>

        <div style={styles.stat}>
          <span style={styles.statNumber}>{userData.posts}</span>
          <span style={styles.statLabel}>Posts</span>
        </div>

        <div style={styles.stat}>
          <span style={styles.statNumber}>{userData.locationsVisited}</span>
          <span style={styles.statLabel}>Locations Visited</span>
        </div>

        <div style={styles.stat}>
          <span style={styles.statNumber}>{userData.speciesSpotted}</span>
          <span style={styles.statLabel}>Species Spotted</span>
        </div>

      </div>

      <div style={styles.buttonRow}>
        <Link to="/edit-profile">
          <button style={styles.editProfileButton}>Edit Profile</button>
        </Link>
        <button onClick={handleSignOut} style={styles.signOutButton}>
          Sign Out
        </button>
      </div>
    </div>
  );
};

const styles = {
  profile: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '50px',
    maxWidth: '600px',
    margin: '100px auto',
    backgroundColor: '##ffffff',
    borderRadius: '8px',
    // boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    maxWidth: '400px',
    margin: '0 auto',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  expandedImageContainer: {
    position: 'relative',
    width: '80%',
    maxWidth: '600px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandedImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  profilePictureContainer: {
    borderRadius: '50%',
    overflow: 'hidden',
    width: '120px',
    height: '120px',
    marginBottom: '20px',
    margin: '0 auto',
  },
  profilePicture: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  closeButton: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: '24px',
    cursor: 'pointer',
  },
  username: {
    fontSize: '1.5em',
    margin: '50px 0 5px',
    color: '#333',
  },
  email: {
    color: '#555',
    fontSize: '1em',
    margin: '5px 0',
  },
  biography: {
    color: '#777',
    fontSize: '0.9em',
    margin: '5px 0 50px',
  },
  statsContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-evenly', // Distribute the stats evenly in the row
    width: '100%',
    marginBottom: '20px',
  },
  stat: {
    display: 'flex',
    flexDirection: 'column', // Stack label under number
    alignItems: 'center',
    flex: 1, // Makes each stat take up equal width
    justifyContent: 'center', // Center vertically
  },
  statNumber: {
    alignSelf: 'center',
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '5px', // Space between number and label
  },
  statLabel: {
    alignSelf: 'center',
    color: '#777',
    fontSize: '0.9em', // Smaller font for the label
    textAlign: 'center',
  },

  buttonRow: {
    display: 'flex',
    gap: '20px', // Space between buttons
    marginTop: '20px',
  },
  signOutButton: {
    padding: '10px 20px',
    fontSize: '1em',
    color: '#fff',
    backgroundColor: '#74C365',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    flex: 1, // Makes both buttons the same size within the row
    width: '120px',
  },
  editProfileButton: {
    padding: '10px 20px',
    fontSize: '1em',
    color: '#fff',
    backgroundColor: '#8FBC8B',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    flex: 1, // Makes both buttons the same size within the row
    width: '120px',
  },
};

export default ProfilePage;
