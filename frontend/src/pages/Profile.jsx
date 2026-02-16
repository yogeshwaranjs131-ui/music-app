import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import api from '../api';
import { FaCamera } from 'react-icons/fa';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const getImageUrl = (path) => {
    if (!path) return 'https://via.placeholder.com/150';
    if (path.startsWith('http')) return path;
    const cleanPath = path.replace(/\\/g, '/');
    return `/${cleanPath.startsWith('/') ? cleanPath.slice(1) : cleanPath}`;
  };

  const handleProfileImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    // This is the crucial part: the key 'profileImage' must match the backend route
    formData.append('profileImage', file);

    setUploading(true);
    setError('');

    try {
      const response = await api.post('/api/auth/upload-profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      // Update the user in the context with the new data from the server
      setUser(response.data);
    } catch (err) {
      console.error("Profile upload failed:", err);
      setError(err.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    return <div className="text-center p-10">Loading profile...</div>;
  }

  return (
    <div className="p-8 text-white">
      <div className="flex items-center gap-8 mb-10">
        <div className="relative w-40 h-40 rounded-full group">
          <img
            src={getImageUrl(user.profileImage)}
            alt={user.username}
            className="w-full h-full object-cover rounded-full shadow-lg"
          />
          <label htmlFor="profile-upload" className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            <FaCamera size={32} />
            <input
              id="profile-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleProfileImageUpload}
              disabled={uploading}
            />
          </label>
        </div>
        <div>
          <p className="text-sm font-bold">Profile</p>
          <h1 className="text-6xl font-extrabold">{user.username}</h1>
          <p className="text-gray-400 mt-2">{user.email}</p>
        </div>
      </div>

      {uploading && <p className="text-green-400 mb-4">Uploading...</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Photo Gallery</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {user.photoGallery && user.photoGallery.map((photo, index) => (
            <div key={index} className="aspect-square bg-gray-800 rounded-lg overflow-hidden">
              <img src={getImageUrl(photo)} alt={`Gallery photo ${index + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
          {/* Add gallery upload button here if needed */}
        </div>
        {(!user.photoGallery || user.photoGallery.length === 0) && (
          <p className="text-gray-500">Your photo gallery is empty.</p>
        )}
      </div>
    </div>
  );
};

export default Profile;