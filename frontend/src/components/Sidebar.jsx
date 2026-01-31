import React, { useState, useEffect } from 'react';
import { FaHome, FaSearch, FaBook, FaPlus, FaHeart, FaCloudUploadAlt, FaTimes } from 'react-icons/fa';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api';
import Logo from './Logo';
import { useAuth } from '../pages/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const cleanPath = path.replace(/\\/g, '/');
    return `${backendUrl}/${cleanPath.startsWith('/') ? cleanPath.slice(1) : cleanPath}`;
  };

  useEffect(() => {
    if (user) {
      api.get('/playlists')
        .then(response => {
          setPlaylists(response.data);
        })
        .catch(err => console.error("Failed to fetch user playlists for sidebar:", err));
    } else {
      setPlaylists([]); // Clear playlists if user logs out
    }
  }, [user]);

  const handleCreatePlaylist = async () => {
    const playlistName = prompt("Enter new playlist name:");
    if (playlistName) {
      try {
        const response = await api.post('/playlists', { name: playlistName });
        setPlaylists(prevPlaylists => [...prevPlaylists, response.data]); // Add new playlist to state
      } catch (error) {
        console.error("Failed to create playlist", error);
        alert("Could not create playlist. Please try again.");
      }
    }
  };

  return (
    <div className={`w-64 bg-black h-full flex-col text-gray-400 p-2 gap-2 transition-transform duration-300 ${isOpen ? 'fixed left-0 top-0 z-50 flex' : 'hidden'} md:flex md:static`}>
      <div className="flex justify-end md:hidden p-2">
          <FaTimes size={24} className="cursor-pointer text-white" onClick={onClose} />
      </div>
      <Logo />
      <div className="bg-spotify-gray p-4 rounded-lg flex flex-col gap-4">
        <Link to="/" onClick={onClose} className={`flex items-center gap-4 transition-colors duration-200 ${location.pathname === '/' ? 'text-white' : 'text-spotify-subtext hover:text-white'}`}>
          <FaHome size={24} />
          <span className="font-bold">Home</span>
        </Link>
        <div className="flex items-center gap-4 cursor-pointer text-spotify-subtext hover:text-white transition-colors duration-200">
          <FaSearch size={24} />
          <span className="font-bold">Search</span>
        </div>
        <Link to="/admin/upload" onClick={onClose} className={`flex items-center gap-4 transition-colors duration-200 ${location.pathname === '/admin/upload' ? 'text-white' : 'text-spotify-subtext hover:text-white'}`}>
          <FaCloudUploadAlt size={24} />
          <span className="font-bold">Upload</span>
        </Link>
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
                <FaHeart size={20} className="text-white" />
              </div>
              <div>
                <p className="text-white font-semibold">Liked Songs</p>
                <p className="text-xs">Playlist</p>
              </div>
            </div>
          </Link>

          {/* User Playlists */}
          {playlists && playlists.map(playlist => (
            <Link to={`/playlist/${playlist._id}`} onClick={onClose} key={playlist._id} className="block">
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

      {user && (
        <div className="bg-spotify-gray p-4 rounded-lg flex items-center gap-3">
          <Link to="/profile" onClick={onClose} className="flex items-center gap-3 hover:opacity-80 transition-opacity overflow-hidden flex-1">
            {user.profileImage ? (
              <img src={getImageUrl(user.profileImage)} alt={user.username} className="w-10 h-10 rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold shrink-0">
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="font-bold text-white truncate">{user.username}</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Sidebar;