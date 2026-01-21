import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../api';

const AdminUpload = () => {
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    singer: '',
    movie: '',
    album: ''
  });
  const [audioFile, setAudioFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.name === 'audio') {
      setAudioFile(e.target.files[0]);
    } else if (e.target.name === 'coverImage') {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!audioFile || !formData.title) {
        alert("Title and Audio file are required!");
        return;
    }

    const data = new FormData();
    data.append('title', formData.title);
    data.append('artist', formData.artist);
    data.append('singer', formData.singer);
    data.append('movie', formData.movie);
    data.append('album', formData.album);
    data.append('audio', audioFile);
    if (imageFile) {
        data.append('coverImage', imageFile);
    }

    setUploading(true);
    try {
      await api.post('/songs', data);
      alert('Song uploaded successfully!');
      setFormData({ title: '', artist: '', singer: '', movie: '', album: '' });
      setAudioFile(null);
      setImageFile(null);
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload song.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="h-screen bg-black flex flex-col">
      <div className="flex flex-1 overflow-hidden pb-20">
        <Sidebar />
        <div className="flex-1 bg-linear-to-b from-gray-800 to-black overflow-y-auto rounded-lg m-2 ml-0 p-8 text-white">
          <h1 className="text-3xl font-bold mb-6">Upload New Song</h1>
          <form onSubmit={handleSubmit} className="max-w-lg space-y-4 bg-gray-900 p-6 rounded-lg">
            <input type="text" name="title" placeholder="Song Title" value={formData.title} onChange={handleChange} className="w-full p-3 bg-gray-800 rounded border border-gray-700" required />
            <input type="text" name="artist" placeholder="Artist / Composer" value={formData.artist} onChange={handleChange} className="w-full p-3 bg-gray-800 rounded border border-gray-700" />
            <input type="text" name="singer" placeholder="Singer Name" value={formData.singer} onChange={handleChange} className="w-full p-3 bg-gray-800 rounded border border-gray-700" />
            <input type="text" name="movie" placeholder="Movie Name" value={formData.movie} onChange={handleChange} className="w-full p-3 bg-gray-800 rounded border border-gray-700" />
            
            <div className="flex flex-col gap-2">
                <label className="text-gray-400 text-sm">Audio File (MP3)</label>
                <input type="file" name="audio" accept="audio/*" onChange={handleFileChange} className="w-full p-2 bg-gray-800 rounded" required />
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-gray-400 text-sm">Cover Image</label>
                <input type="file" name="coverImage" accept="image/*" onChange={handleFileChange} className="w-full p-2 bg-gray-800 rounded" />
            </div>

            <button type="submit" disabled={uploading} className={`w-full bg-green-500 text-black font-bold py-3 rounded hover:bg-green-400 transition ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {uploading ? 'Uploading...' : 'Upload Song'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminUpload;