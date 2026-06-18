import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import { useAuth } from '../pages/AuthContext'; // Make sure this path is correct
import Player from './Player';
import Sidebar from './Sidebar';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsAccountDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsAccountDropdownOpen(false);
    navigate('/'); // Navigate to home after logout
  };

  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  // Helper function to format image URLs correctly
  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const cleanPath = path.replace(/\\/g, '/');
    return `${backendUrl}/${cleanPath.startsWith('/') ? cleanPath.slice(1) : cleanPath}`;
  };

  return (
    <div className="flex h-screen bg-black text-white">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      {/* Main Content Area (Right Side) */}
      <div className="flex-1 flex flex-col overflow-hidden md:rounded-lg bg-linear-to-b from-[#1f1f1f] to-[#121212] md:mr-2 md:my-2 relative">
        {/* Top Bar (Navigation Arrows & Auth) - Optional but good for UX */}
        <div className="h-16 bg-black/30 flex items-center justify-between px-6 sticky top-0 z-10 backdrop-blur-md">
           <div className="flex gap-2">
              <button className="text-white md:hidden" onClick={() => setIsSidebarOpen(true)}>
                <FaBars size={24} />
              </button>
              {/* Add back/forward buttons here if needed */}
           </div>
           <div className="flex items-center gap-4">
              {user ? (
                 <div className="relative" ref={dropdownRef}>
                    <button 
                      onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)} 
                      className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center font-bold border border-black cursor-pointer hover:scale-105 transition overflow-hidden" 
                      title="Account"
                    >
                      {user.profileImage ? (
                        <img src={getImageUrl(user.profileImage)} alt={user.username} className="w-full h-full object-cover" />
                      ) : (
                        user.username.charAt(0).toUpperCase()
                      )}
                    </button>
                    {isAccountDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-[#282828] rounded-md shadow-lg z-20 py-1">
                        <Link to="/profile" onClick={() => setIsAccountDropdownOpen(false)} className="block px-4 py-2 text-sm text-[#b3b3b3] hover:bg-[#3e3e3e] rounded-t-md">Profile</Link>
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
      <Player />
    </div>
  );
};

export default MainLayout;