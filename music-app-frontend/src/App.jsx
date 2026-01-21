import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import LikedSongs from './pages/LikedSongs';
import Profile from './pages/Profile';
import PlaylistPage from './pages/PlaylistPage';
import AdminUpload from './pages/AdminUpload';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/collection/tracks" element={<LikedSongs />} />
      <Route path="/playlist/:id" element={<PlaylistPage />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/admin/upload" element={<AdminUpload />} />
    </Routes>
  );
}

export default App;