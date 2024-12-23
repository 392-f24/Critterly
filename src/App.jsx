import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import CreatePost from './components/CreatePost';
import Map from './components/Map';
import ViewPost from './components/ViewPost';
import callGPT from './utilities/aicall';
import ProfilePage from './components/ProfileView.jsx';
import SignInPage from './components/SigninPage.jsx';
import EditProfilePage from './components/EditProfile.jsx';

const App = () => {
  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          {/* Map Page */}
          <Route path="/" element={<Map />} />

          {/* Add post route */}
          <Route path="/create_post" element={<CreatePost />} />

          {/* View Post Route */}
          <Route path="/view_post" element={<ViewPost />}/>

          {/* Profile Routes */}
          <Route path="/view_profile" element={<ProfilePage />}/> {/* Own profile */}
          <Route path="/profile/:userId" element={<ProfilePage />}/> {/* Other user's profile */}

          {/* Sign In and Edit Profile */}
          <Route path="/signinpage" element={<SignInPage />}/>
          <Route path="/edit_profile" element={<EditProfilePage />}/>

        </Routes>
      </div>
    </Router>
  );
};

// function App() {
//     const testGPTCall = async () => {
//         const response = await callGPT('Tell me a fun fact about space.');
//         console.log('GPT Response:', response);
//     };
//
//     return (
//         <div>
//             <h1>Test GPT API Call</h1>
//             <button onClick={testGPTCall}>Ask GPT</button>
//         </div>
//     );
// }

export default App;