import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from './AuthContext';
import { FaTrash } from 'react-icons/fa';

const Profile = () => {
  const { user, setUser, loading, logout } = useAuth();
  const [profilePicUploading, setProfilePicUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Helper function to format image URLs correctly
  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const cleanPath = path.replace(/\\/g, '/');
    return `${backendUrl}/${cleanPath.startsWith('/') ? cleanPath.slice(1) : cleanPath}`;
  };

  useEffect(() => {
    // If the context is done loading and there's no user, redirect to login.
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleUpload = async (e, uploadType) => {
    const file = e.target.files[0];
    if (!file) return;

    const endpoint = uploadType === 'profile' ? '/auth/upload-profile' : '/auth/upload-gallery-photo';
    const formKey = uploadType === 'profile' ? 'profileImage' : 'galleryPhoto';
    const setLoading = uploadType === 'profile' ? setProfilePicUploading : setGalleryUploading;

    const formData = new FormData();
    formData.append(formKey, file);

    setLoading(true);
    try {
        // The api instance already includes the auth token from AuthContext
        const response = await api.post(endpoint, formData);
        setUser(response.data);
    } catch (error) {
        console.error(`Error uploading ${uploadType} image`, error);
        alert(error.response?.data?.message || `Failed to upload image: ${error.message}`);
    } finally {
        setLoading(false);
        e.target.value = null; // Reset input
    }
  };

  const handleFileChange = (e) => handleUpload(e, 'profile');
  const handleGalleryFileChange = (e) => handleUpload(e, 'gallery');

  const handleDeletePhoto = async (photoUrl) => {
    if (!window.confirm("Are you sure you want to delete this photo?")) return;

    try {
      // The api instance already includes the auth token from AuthContext
      const response = await api.delete('/auth/gallery-photo', {
        data: { photoUrl }
      });
      setUser(response.data);
    } catch (error) {
      console.error("Failed to delete photo", error);
      alert(error.response?.data?.message || "Failed to delete photo");
    }
  };

  return (
    <div className="p-8">
          <h1 className="text-4xl font-bold mb-6">Profile</h1>
          {user ? (
            <div className="bg-gray-900 p-6 rounded-lg max-w-md">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative w-20 h-20 group">
                  {user.profileImage ? (
                    <img src={getImageUrl(user.profileImage)} alt="Profile" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-purple-600 rounded-full flex items-center justify-center text-3xl font-bold">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <label htmlFor="profile-upload" className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                    <span className="text-xs text-white">{profilePicUploading ? '...' : 'Edit'}</span>
                  </label>
                  <input type="file" id="profile-upload" className="hidden" accept="image/*" onChange={handleFileChange} disabled={profilePicUploading} />
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

              {/* Photo Gallery Section */}
              <div className="mt-8">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold">My Photos</h3>
                      <label htmlFor="gallery-upload" className={`bg-green-500 text-black px-4 py-1 rounded-full text-sm font-bold cursor-pointer hover:bg-green-400 ${galleryUploading ? 'opacity-50' : ''}`}>
                          {galleryUploading ? 'Adding...' : 'Add Photo'}
                      </label>
                      <input type="file" id="gallery-upload" className="hidden" accept="image/*" onChange={handleGalleryFileChange} disabled={galleryUploading} />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                      {user.photoGallery && user.photoGallery.length > 0 ? (
                          user.photoGallery.map((photoUrl, index) => (
                              <div key={index} className="relative aspect-square bg-gray-800 rounded group">
                                  <img src={getImageUrl(photoUrl)} alt={`Gallery photo ${index + 1}`} className="w-full h-full object-cover rounded" />
                                  <button onClick={() => handleDeletePhoto(photoUrl)} className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700">
                                    <FaTrash size={12} />
                                  </button>
                              </div>
                          ))
                      ) : (
                          <p className="text-gray-500 col-span-3 text-sm mt-2">Your photo gallery is empty.</p>
                      )}
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
  );
};

export default Profile;