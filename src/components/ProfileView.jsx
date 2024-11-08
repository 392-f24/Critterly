import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auth, storage, db } from "../utilities/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, getDoc } from 'firebase/firestore';
import { SignOutButton } from '../components/Navigation';
import profilePic from '../mock_data/Default_Profile.png';
import { updateDoc } from "firebase/firestore";


const ProfilePage = () => {
  const [userData, setUserData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [newProfilePic, setNewProfilePic] = useState(null);
  const [newBiography, setNewBiography] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Check if there is a currently authenticated user
        const user = auth.currentUser;
        if (user) {
          const userDocRef = doc(db, "users", user.uid); // Reference to the user's document
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const data = userDoc.data();

            setUserData({
              profilePicture: data.profilePicture || profilePic,    
              username: data.username || "Default Name",
              email: data.email || "default@example.com",
              biography: data.biography || "",
              posts: data.posts || 0,
              locationsVisited: Array.isArray(data.Locations) ? data.Locations.length : 0,
              speciesSpotted: Array.isArray(data.Species) ? data.Species.length : 0
            });

            console.log("User data:", data);
          } else {
            console.log("No user profile found in Firestore.");
          }
        } else {
          console.log("No authenticated user found.");
        }
      } catch (error) {
        console.error("Error fetching user data from Firestore:", error);
      }
    };

    fetchUser();
  }, []);

  // Toggle the expanded view
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleEditProfile = () => setIsEditing(true);

  const handleSaveChanges = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userDocRef = doc(db, "users", user.uid);

      // Update biography if changed
      if (newBiography !== userData.biography) {
        await updateDoc(userDocRef, { Biography: newBiography });
      }

      // Update profile picture if a new one is uploaded
      if (newProfilePic) {
        const profilePicRef = ref(storage, `profilePictures/${user.uid}`);
        await uploadBytes(profilePicRef, newProfilePic);
        const profilePicURL = await getDownloadURL(profilePicRef);
        await updateDoc(userDocRef, { "Profile Picture": profilePicURL });
        setUserData((prev) => ({ ...prev, profilePicture: profilePicURL }));
      }

      setUserData((prev) => ({ ...prev, biography: newBiography }));
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <div style={styles.profile}>
      {/* Profile Picture */}
      <div style={styles.profilePictureContainer}>
        <img
          src={userData.profilePicture} 
          alt="Profile"
          style={styles.profilePicture}
          onClick={toggleExpanded}
        />
      </div>

      {/* Expanded View */}
      {isExpanded && (
        <div style={styles.overlay} onClick={toggleExpanded}>
          <div style={styles.expandedImageContainer}>
            <img
              src={userData.profilePicture}
              alt="Profile Expanded"
              style={styles.expandedImage}
            />
            <button style={styles.closeButton} onClick={toggleExpanded}>
              &times;
            </button>
          </div>
        </div>
      )}

{isEditing ? (
        <>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setNewProfilePic(e.target.files[0])}
            style={styles.fileInput}
          />
          <textarea
            value={newBiography}
            onChange={(e) => setNewBiography(e.target.value)}
            style={styles.biographyInput}
            placeholder="Update your biography"
          />
          <button onClick={handleSaveChanges} style={styles.saveButton}>Save Changes</button>
        </>
      ) : (
        <>
          <h2 style={styles.username}>{userData.username}</h2>
          <p style={styles.email}>{userData.email}</p>
          <p style={styles.biography}>{userData.biography}</p>

          <button onClick={handleEditProfile} style={styles.editButton}>Edit Profile</button>
        </>
      )}
      
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
        <SignOutButton />
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
  biography: {
    lineHeight: '1.6',
    padding: '10px',
    width: '100%',
    color: '#777',
    fontSize: '0.9em',
    margin: '5px 0 50px',
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
