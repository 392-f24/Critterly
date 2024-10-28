import { NavLink } from 'react-router-dom';
import { signInWithGoogle, signOut, useAuthState } from '../utilities/firebase';

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

const SignInButton = () => (
  <button 
    onClick={signInWithGoogle}
    style={{
      ...buttonBaseStyle,
      backgroundColor: '#28A745',
      marginLeft: 'auto'
    }}
  >
    <i className="fa-solid fa-sign-in-alt" style={{ fontSize: '12px' }}></i>
    Sign in with Google
  </button>
);

const SignOutButton = () => (
  <button 
    onClick={signOut}
    style={{
      ...buttonBaseStyle,
      backgroundColor: '#DC3545',
      marginLeft: 'auto'
    }}
  >
    <i className="fa-solid fa-sign-out-alt" style={{ fontSize: '12px' }}></i>
    Sign out
  </button>
);

const AuthButton = () => {
  const [user] = useAuthState();
  return user ? <SignOutButton /> : <SignInButton />;
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
        Critterly
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

  button[onClick="signOut"]:hover {
    background-color: #C82333 !important;
  }
`;

export default Navigation;