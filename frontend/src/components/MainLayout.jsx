import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { FaHome, FaSearch, FaPlus, FaHeart, FaMusic, FaCloudUploadAlt } from 'react-icons/fa';
import api from '../api';
import { useAuth } from '../pages/AuthContext'; // Make sure this path is correct
import Logo from './Logo';

const MainLayout = () => {
  const [playlists, setPlaylists] = useState([]);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchPlaylists();
    }
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  const fetchPlaylists = async () => {
    try {
      const res = await api.get('/api/playlists');
      setPlaylists(res.data);
    } catch (err) {
      console.error("Failed to fetch playlists", err);
    }
  };

  const createPlaylist = async () => {
    const name = prompt("Enter playlist name:");
    if (!name) return;
    try {
      const res = await api.post('/api/playlists', { name });
      setPlaylists([...playlists, res.data]);
    } catch (err) {
      console.error("Failed to create playlist", err);
    }
  };

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate('/'); // Navigate to home after logout
  };

  // Helper function to format image URLs correctly
  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const cleanPath = path.replace(/\\/g, '/');
    return `/${cleanPath.startsWith('/') ? cleanPath.slice(1) : cleanPath}`;
  };

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar */}
      <div className="w-75 bg-black hidden md:flex flex-col gap-2 p-2 h-full">
         {/* Navigation */}
         <div className="bg-[#121212] rounded-lg p-5 flex flex-col gap-5">
            <div className="mb-2">
               <Logo />
            </div>
            <Link to="/" className="flex items-center gap-4 text-[#b3b3b3] hover:text-white transition font-bold">
              <FaHome size={24} /> Home
            </Link>
            <Link to="/search" className="flex items-center gap-4 text-[#b3b3b3] hover:text-white transition font-bold">
              <FaSearch size={24} /> Search
            </Link>
            <Link to="/admin/upload" className="flex items-center gap-4 text-[#b3b3b3] hover:text-white transition font-bold">
              <FaCloudUploadAlt size={24} /> Upload Songs
            </Link>
         </div>

         {/* Library Section */}
         <div className="bg-[#121212] rounded-lg flex-1 p-2 flex flex-col overflow-hidden">
            <div className="flex justify-between items-center px-2 py-2 mb-2">
              <div className="text-[#b3b3b3] hover:text-white font-bold flex items-center gap-2 cursor-pointer transition">
                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current"><path d="M3 22a1 1 0 0 1-1-1V3a1 1 0 0 1 2 0v18a1 1 0 0 1-1 1zM15.5 2.134A1 1 0 0 0 14 3v18a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V6.464a1 1 0 0 0-.5-.866l-6-3.464zM9 2a1 1 0 0 0-1 1v18a1 1 0 1 0 2 0V3a1 1 0 0 0-1-1z"></path></svg>
                Your Library
              </div>
              <button onClick={createPlaylist} className="text-[#b3b3b3] hover:text-white hover:bg-[#1f1f1f] p-2 rounded-full transition" title="Create playlist">
                <FaPlus />
              </button>
            </div>

            {/* Filter Chips */}
            <div className="flex gap-2 px-2 mb-4 overflow-x-auto scrollbar-hide">
               <span className="bg-[#232323] hover:bg-[#2a2a2a] text-white text-sm px-3 py-1 rounded-full cursor-pointer transition whitespace-nowrap">Playlists</span>
               <span className="bg-[#232323] hover:bg-[#2a2a2a] text-white text-sm px-3 py-1 rounded-full cursor-pointer transition whitespace-nowrap">Artists</span>
            </div>

            {/* Scrollable Playlist List */}
            <div className="flex-1 overflow-y-auto space-y-0 scrollbar-thin scrollbar-thumb-gray-700 hover:scrollbar-thumb-gray-600">
              {/* Liked Songs Static Link - Corrected path */}
              <Link to="/collection/tracks" className="flex items-center gap-3 p-2 rounded-md hover:bg-[#1f1f1f] cursor-pointer transition group">
                <div className="w-12 h-12 bg-linear-to-br from-[#450af5] to-[#c4efd9] rounded-md flex items-center justify-center group-hover:shadow-lg shrink-0">
                  <FaHeart className="text-white" size={16} />
                </div>
                <div className="flex flex-col justify-center overflow-hidden">
                  <p className="font-bold text-white text-sm truncate">Liked Songs</p>
                  <p className="text-xs text-[#b3b3b3] flex items-center gap-1">
                     <span className="text-green-500 text-[10px]">📌</span> Playlist
                  </p>
                </div>
              </Link>

              {/* Dynamic Playlists */}
              {playlists.map(playlist => (
                <Link key={playlist._id} to={`/playlist/${playlist._id}`} className="flex items-center gap-3 p-2 rounded-md hover:bg-[#1f1f1f] cursor-pointer transition">
                  <div className="w-12 h-12 bg-[#282828] rounded-md flex items-center justify-center shrink-0">
                    <FaMusic className="text-[#b3b3b3]" size={20} />
                  </div>
                  <div className="flex flex-col justify-center overflow-hidden">
                    <p className="font-bold text-white text-sm truncate">{playlist.name}</p>
                    <p className="text-xs text-[#b3b3b3] truncate">Playlist • {user?.username}</p>
                  </div>
                </Link>
              ))}
            </div>
         </div>
      </div>
      
      {/* Main Content Area (Right Side) */}
      <div className="flex-1 flex flex-col overflow-hidden rounded-lg bg-linear-to-b from-[#1f1f1f] to-[#121212] mr-2 my-2 relative">
        {/* Top Bar (Navigation Arrows & Auth) - Optional but good for UX */}
        <div className="h-16 bg-black/30 flex items-center justify-between px-6 sticky top-0 z-10 backdrop-blur-md">
           <div className="flex gap-2">
              {/* Add back/forward buttons here if needed */}
           </div>
           <div className="flex items-center gap-4">
              {user ? (
                 <div className="relative" ref={dropdownRef}>
                    <button 
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
                      className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center font-bold border border-black cursor-pointer hover:scale-105 transition overflow-hidden" 
                      title="Account"
                    >
                      {user.profileImage ? (
                        <img src={getImageUrl(user.profileImage)} alt={user.username} className="w-full h-full object-cover" />
                      ) : (
                        user.username.charAt(0).toUpperCase()
                      )}
                    </button>
                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-[#282828] rounded-md shadow-lg z-20 py-1">
                        <Link to="/profile" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-[#b3b3b3] hover:bg-[#3e3e3e] rounded-t-md">Profile</Link>
                        <div className="border-t border-gray-700 my-1"></div>
                        <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-[#b3b3b3] hover:bg-[#3e3e3e] rounded-b-md">Log out</button>
                      </div>
                    )}
                 </div>
              ) : (
                 <div className="flex gap-4">
                    <Link to="/login" className="bg-white text-black px-6 py-2 rounded-full font-bold hover:scale-105 transition">Log in</Link>
                 </div>
              )}
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;