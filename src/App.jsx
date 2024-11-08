import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import CreatePost from './components/CreatePost';
import Map from './components/Map';
import ViewPost from './components/ViewPost';
import callGPT from './utilities/aicall';
import {GoogleMapsProvider} from './components/GoogleMapAPI';

const App = () => {
  return (
    <GoogleMapsProvider>
    <Router>
      <div className="min-h-screen">
        <Routes>
          {/* Map Page */}
          <Route path="/" element={<Map/>} />


          {/* Add post route */}
          <Route path="/create_post" element={<CreatePost />} />

          {/* View Post Route */}
          <Route path="/view_post" element={<ViewPost />}/>


        </Routes>
      </div>
    </Router>
  </GoogleMapsProvider>
  
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
