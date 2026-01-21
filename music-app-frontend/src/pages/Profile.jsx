import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Player from '../components/Player';
import api from '../api';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        const response = await api.get('/auth/user');
        setUser(response.data);
      } catch (error) {
        console.error('Failed to fetch user', error);
        navigate('/login');
      }
    };
    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profileImage', file);

    setUploading(true);
    try {
        const response = await api.post('/auth/upload-profile', formData);
        setUser(response.data);
    } catch (error) {
        console.error("Error uploading image", error);
        alert("Failed to upload image");
    } finally {
        setUploading(false);
    }
  };

  return (
    <div className="h-screen bg-black flex flex-col">
      <div className="flex flex-1 overflow-hidden pb-20">
        <Sidebar />
        <div className="flex-1 bg-linear-to-b from-gray-800 to-black overflow-y-auto rounded-lg m-2 ml-0 p-8 text-white">
          <h1 className="text-4xl font-bold mb-6">Profile</h1>
          {user ? (
            <div className="bg-gray-900 p-6 rounded-lg max-w-md">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative w-20 h-20 group">
                  {user.profileImage ? (
                    <img src={user.profileImage} alt="Profile" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-purple-600 rounded-full flex items-center justify-center text-3xl font-bold">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <label htmlFor="profile-upload" className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                    <span className="text-xs text-white">Edit</span>
                  </label>
                  <input type="file" id="profile-upload" className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploading} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{user.username}</h2>
                  <p className="text-gray-400">User</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-gray-400 text-sm">Email</label>
                  <p className="text-lg">{user.email}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">User ID</label>
                  <p className="text-sm text-gray-500 font-mono">{user._id}</p>
                </div>
                 <div>
                  <label className="text-gray-400 text-sm">Liked Songs</label>
                  <p className="text-lg">{user.likedSongs ? user.likedSongs.length : 0}</p>
                </div>
              </div>

              <button 
                onClick={handleLogout}
                className="mt-8 bg-red-600 text-white px-6 py-2 rounded-full font-bold hover:bg-red-700 transition w-full"
              >
                Logout
              </button>
            </div>
          ) : (
            <p>Loading profile...</p>
          )}
        </div>
      </div>
      <Player /> 
    </div>
  );
};

export default Profile;