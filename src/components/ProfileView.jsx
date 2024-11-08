import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate, useParams } from 'react-router-dom';
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
      Sign out
    </button>
  );
};

const ProfilePage = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { userId } = useParams(); // Get userId from URL params
  const navigate = useNavigate();
  const { user } = useAuthState();
  const [userData, setUserData] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [dataError, setDataError] = useState(null);
  const isOwnProfile = !userId || (user && userId === user.uid);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        const targetUserId = isOwnProfile ? user?.uid : userId;
        
        if (!targetUserId) {
          setDataError(new Error("No user ID available"));
          return;
        }

        const userDocRef = doc(db, "users", targetUserId);
        const query = await getDoc(userDocRef);

        if (!query.exists()) {
          setDataError(new Error("User not found"));
          return;
        }

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
        console.error("Error fetching user data:", error);
        setDataError(error);
      } finally {
        setLoadingData(false);
      }
    };

    if (user || userId) {
      fetchData();
    }
  }, [user, userId, isOwnProfile]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  if (loadingData) {
    return (
      <div style={styles.loadingContainer}>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (dataError) {
    return (
      <div style={styles.errorContainer}>
        <p>Error loading profile: {dataError.message}</p>
        <button 
          onClick={() => navigate('/')}
          style={styles.backButton}
        >
          Return to Feed
        </button>
      </div>
    );
  }

  if (!userData) {
    return (
      <div style={styles.errorContainer}>
        <p>No profile data available</p>
        <button 
          onClick={() => navigate('/')}
          style={styles.backButton}
        >
          Return to Feed
        </button>
      </div>
    );
  }

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
        {isOwnProfile ? (
          <>
            <Link to="/edit_profile">
              <button style={styles.editProfileButton}>Edit Profile</button>
            </Link>
            <SignOutButton />
          </>
        ) : (
          <button 
            onClick={() => navigate('/')}
            style={styles.backButton}
          >
            Map View
          </button>
        )}
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
    backgroundColor: '#ffffff',
    borderRadius: '8px',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '1.2em',
    color: '#666',
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    gap: '20px',
    color: '#666',
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
    justifyContent: 'space-evenly',
    width: '100%',
    marginBottom: '20px',
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  statNumber: {
    alignSelf: 'center',
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '5px',
  },
  statLabel: {
    alignSelf: 'center',
    color: '#777',
    fontSize: '0.9em',
    textAlign: 'center',
  },
  buttonRow: {
    display: 'flex',
    gap: '20px',
    marginTop: '20px',
  },
  signOutButton: {
    padding: '10px 20px',
    fontSize: '1em',
    color: '#fff',
    backgroundColor: '#8FBC8B',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    width: '120px',
  },
  editProfileButton: {
    padding: '10px 20px',
    fontSize: '1em',
    color: '#fff',
    backgroundColor: '#87A96B',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    width: '120px',
  },
  backButton: {
    padding: '10px 20px',
    fontSize: '1em',
    color: '#fff',
    backgroundColor: '#4A90E2',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    width: '120px',
  }
};

export default ProfilePage;