import React, { useState, useEffect } from 'react';
import { FaHome, FaSearch, FaBook, FaPlus, FaHeart, FaSignOutAlt, FaCloudUploadAlt } from 'react-icons/fa';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api';
import Logo from './Logo';

const Sidebar = ({ playlists }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleCreatePlaylist = async () => {
    const playlistName = prompt("Enter new playlist name:");
    if (playlistName) {
      try {
        const response = await api.post('/playlists', { name: playlistName });
        setPlaylists(prevPlaylists => [...prevPlaylists, response.data]);
      } catch (error) {
        console.error("Failed to create playlist", error);
        alert("Could not create playlist. Please try again.");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="w-64 bg-black h-full flex-col text-gray-400 p-2 gap-2 hidden md:flex">
      <Logo />
      <div className="bg-spotify-gray p-4 rounded-lg flex flex-col gap-4">
        <Link to="/" className={`flex items-center gap-4 transition-colors duration-200 ${location.pathname === '/' ? 'text-white' : 'text-spotify-subtext hover:text-white'}`}>
            <FaHome size={24} />
            <span className="font-bold">Home</span>
        </Link>
        <div className="flex items-center gap-4 cursor-pointer text-spotify-subtext hover:text-white transition-colors duration-200">
            <FaSearch size={24} />
            <span className="font-bold">Search</span>
        </div>
        <Link to="/admin/upload" className={`flex items-center gap-4 transition-colors duration-200 ${location.pathname === '/admin/upload' ? 'text-white' : 'text-spotify-subtext hover:text-white'}`}>
            <FaCloudUploadAlt size={24} />
            <span className="font-bold">Upload</span>
        </Link>
        <div className="flex items-center gap-4 cursor-pointer text-spotify-subtext hover:text-white transition-colors duration-200" onClick={handleLogout}>
            <FaSignOutAlt size={24} />
            <span className="font-bold">Logout</span>
        </div>
      </div>
      
      <div className="bg-spotify-gray flex-1 rounded-lg p-2 flex flex-col">
        <div className="flex justify-between items-center p-2">
            <div className="flex items-center gap-2 hover:text-white cursor-pointer">
                <FaBook size={24} />
                <span className="font-bold">Your Library</span>
            </div>
            <FaPlus className="hover:text-white cursor-pointer" onClick={handleCreatePlaylist} title="Create playlist" />
        </div>
        
        <div className="flex-1 overflow-y-auto mt-2 space-y-2 pr-2">
          {/* Liked Songs */}
          <Link to="/collection/tracks" className="block">
            <div className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors duration-200 ${location.pathname === '/collection/tracks' ? 'bg-spotify-light-gray' : 'hover:bg-spotify-light-gray'}`}>
              <div className="w-12 h-12 bg-linear-to-br from-purple-600 to-indigo-400 flex items-center justify-center rounded">
                <FaHeart size={20} className="text-white"/>
              </div>
              <div>
                <p className="text-white font-semibold">Liked Songs</p>
                <p className="text-xs">Playlist</p>
              </div>
            </div>
          </Link>

          {/* User Playlists */}
          {playlists && playlists.map(playlist => (
            <Link to={`/playlist/${playlist._id}`} key={playlist._id} className="block">
              <div className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors duration-200 ${location.pathname === `/playlist/${playlist._id}` ? 'bg-spotify-light-gray' : 'hover:bg-spotify-light-gray'}`}>
                <div className="w-12 h-12 bg-gray-700 flex items-center justify-center rounded text-gray-400">
                  <FaBook />
                </div>
                <div>
                  <p className="text-white font-semibold truncate">{playlist.name}</p>
                  <p className="text-xs">Playlist</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;