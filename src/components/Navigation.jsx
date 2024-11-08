import { NavLink, Link, useNavigate } from 'react-router-dom';
import { signInWithGoogle, signOut, useAuthState, db, auth } from '../utilities/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const buttonBaseStyle = {
  border: 'none',
  borderRadius: '8px',
  padding: '10px 20px',
  fontSize: '14px',
  fontWeight: '500',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  transition: 'all 0.2s ease-in-out',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  color: 'white'
};

export const SignInButton = () => {
  const navigate = useNavigate();

  const handleSignIn = async () => {
      try {
          await signInWithGoogle();
          
          // Check if the auth state changes after Google sign-in
          onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Check if the user is already in Firestore
                const userDocRef = doc(db, 'users', user.uid);
                const userDoc = await getDoc(userDocRef);

                if (!userDoc.exists()) {
                    // New user: navigate to profile setup
                    navigate('/signinpage');
                } else {
                    // Existing user: navigate to profile or main page
                    navigate('/');
                }
              }
          });
      } catch (error) {
          console.error("Sign-in failed:", error);
      }
  };

  return (
      <button 
        onClick={handleSignIn}
        style={{
          backgroundColor: '#87A96B',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '8px',
          cursor: 'pointer',
          border: 'none',
        }}
      >
          <i className="fa-solid fa-sign-in-alt" style={{ fontSize: '12px' }}></i> Sign in with Google
      </button>
  );
};


export const SignOutButton = () => {
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
      style={{
        border: 'none',
        borderRadius: '8px',
        padding: '10px 20px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.2s ease-in-out',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        backgroundColor: '#DC3545',
        color: 'white',
        marginLeft: 'auto'
      }}
    >
      <i className="fa-solid fa-sign-out-alt" style={{ fontSize: '12px' }}></i>
      Sign out
    </button>
  );
};


const ProfileButton = () => {
  const {user, loading, error} = useAuthState();
  console.log(user);
  return (
    <Link to="/view_profile" style={{ textDecoration: 'none' }}>
    <button 
      style={{
        ...buttonBaseStyle,
        backgroundColor: '#8FBC8B',
        marginLeft: 'auto'
      }}
    >
      <i className="fa-solid fa-user" style={{ fontSize: '12px' }}></i>
      Profile
    </button>
  </Link>
  ) 
};


const AuthButton = () => {
  const {user, loading, error} = useAuthState();
  return user ? <ProfileButton /> : <SignInButton />;
};

const Navigation = () => (
  <nav style={{
    padding: '12px 20px',
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    zIndex: 1000
  }}>
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '20px'
    }}>
      {/* Add your logo or site name here if needed */}
      <span style={{
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#333'
      }}>
        critterly
      </span>
    </div>
    <AuthButton />
  </nav>
);


const styles = `
  button:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  }

  button[onClick="signInWithGoogle"]:hover {
    background-color: #218838 !important;
  }

  a[href="/profile"] button:hover {
    background-color: #0056b3 !important;
  }
`;

export default Navigation;