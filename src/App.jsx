import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import CreatePost from './components/CreatePost';
import Map from './components/Map'

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
          {/*<Route path="/view_post" element={<Podcast />}/> */}


        </Routes>
      </div>
    </Router>
  );
};

export default App;
