import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { auth, storage, db } from "../utilities/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, getDoc } from 'firebase/firestore';
import profilePic from '../mock_data/Default_Profile.png';
import { updateDoc } from "firebase/firestore";
import { useAuthState, signOut } from '../utilities/firebase';

const SignOutButton = () => {
  const navigate = useNavigate();
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/'); // Redirect to the homepage after signing out
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <button 
      onClick={handleSignOut}
      style={styles.signOutButton}>
      {/* <i className="fa-solid fa-sign-out-alt" style={{ padding: '5px', fontSize: '12px' }}></i> */}
      Sign out
    </button>
  );
};


const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [newProfilePic, setNewProfilePic] = useState(null);
  const [newBiography, setNewBiography] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const { user, loading, error } = useAuthState();
  const [userData, setUserData] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [dataError, setDataError] = useState(null);
  


  useEffect(() => {
    if (user) {
      // When user is available, start fetching additional data
      const fetchData = async () => {
        try {
          setLoadingData(true);
          const userDocRef = await doc(db, "users", user.uid); // Reference to the user's document
          const query = await getDoc(userDocRef);

          const data = query.data();

          
          setUserData({
            profilePicture: data.profilePicture || profilePic,    
            username: data.username || "Default Name",
            email: data.email || "default@example.com",
            biography: data.biography || "",
            posts: data.posts || 0,
            locationsVisited: Array.isArray(data.Locations) ? data.Locations.length : 0,
            speciesSpotted: Array.isArray(data.Species) ? data.Species.length : 0
          });

        } catch (error) {
          setDataError(error);
        } finally {
          setLoadingData(false);
        }
      };
      fetchData();
    }
  }, [user]);


  // Toggle the expanded view
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // const handleEditProfile = () => setIsEditing(true);

  // const handleSaveChanges = async () => {
  //   try {
  //     const user = auth.currentUser;
  //     if (!user) return;

  //     const userDocRef = doc(db, "users", user.uid);

  //     // Update biography if changed
  //     if (newBiography !== userData.biography) {
  //       await updateDoc(userDocRef, { Biography: newBiography });
  //     }

  //     // Update profile picture if a new one is uploaded
  //     if (newProfilePic) {
  //       const profilePicRef = ref(storage, `profilePictures/${user.uid}`);
  //       await uploadBytes(profilePicRef, newProfilePic);
  //       const profilePicURL = await getDownloadURL(profilePicRef);
  //       await updateDoc(userDocRef, { "Profile Picture": profilePicURL });
  //       setUserData((prev) => ({ ...prev, profilePicture: profilePicURL }));
  //     }

  //     setUserData((prev) => ({ ...prev, biography: newBiography }));
  //     setIsEditing(false);
  //   } catch (error) {
  //     console.error("Error updating profile:", error);
  //   }
  // };

  if (loading || loadingData) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  if (dataError) {
    return <p>Error fetching user data: {dataError.message}</p>;
  }

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
      <Link to="/edit_profile">
        <button style={styles.editProfileButton}>Edit Profile</button>
      </Link>
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
    backgroundColor: '#8FBC8B',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    flex: 1, // Makes both buttons the same size within the row
    width: '120px',
    borderRadius: '8px',
  },
  editProfileButton: {
    padding: '10px 20px',
    fontSize: '1em',
    color: '#fff',
    backgroundColor: '#87A96B',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    flex: 1, // Makes both buttons the same size within the row
    width: '120px',
    borderRadius: '8px',
  },
};

export default ProfilePage;
