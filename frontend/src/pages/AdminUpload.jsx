import React, { useState } from 'react';
import api from '../api';

const AdminUpload = () => {
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    singer: '',
    movie: '',
    album: ''
  });
  const [audioFiles, setAudioFiles] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.name === 'audio') {
      setAudioFiles(Array.from(e.target.files));
    } else if (e.target.name === 'coverImage') {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!audioFiles || audioFiles.length === 0) {
        alert("Please select audio files!");
        return;
    }

    // If single file, title is required. If multiple, title is auto-generated.
    if (audioFiles.length === 1 && !formData.title) {
        alert("Title is required for single file upload!");
        return;
    }

    setUploading(true);

    try {
      // Loop through all selected files
      for (let i = 0; i < audioFiles.length; i++) {
        const file = audioFiles[i];
        const data = new FormData();
        
        // Use input title for single file, or filename for bulk
        const songTitle = audioFiles.length === 1 ? formData.title : file.name.replace(/\.[^/.]+$/, "");

        data.append('title', songTitle);
        data.append('artist', formData.artist);
        data.append('singer', formData.singer);
        data.append('movie', formData.movie);
        data.append('album', formData.album);
        data.append('audio', file);
        if (imageFile) {
            data.append('coverImage', imageFile);
        }

        await api.post('/api/songs', data);
      }

      alert(audioFiles.length > 1 ? 'All songs uploaded successfully!' : 'Song uploaded successfully!');
      setFormData({ title: '', artist: '', singer: '', movie: '', album: '' });
      setAudioFiles([]);
      setImageFile(null);
      
      // Reset file inputs
      document.getElementById('audio-input').value = '';
      document.getElementById('image-input').value = '';
    } catch (error) {
      console.error("Upload failed", error);
      alert(error.response?.data?.message || "Failed to upload songs.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-8">
          <h1 className="text-3xl font-bold mb-6">Upload Songs</h1>
          <form onSubmit={handleSubmit} className="max-w-lg space-y-4 bg-gray-900 p-6 rounded-lg">
            <div className="flex flex-col gap-2">
                <label className="text-gray-400 text-sm">Song Title {audioFiles.length > 1 && '(Auto-filled from filenames)'}</label>
                <input 
                    type="text" 
                    name="title" 
                    placeholder="Song Title" 
                    value={formData.title} 
                    onChange={handleChange} 
                    className={`w-full p-3 bg-gray-800 rounded border border-gray-700 ${audioFiles.length > 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={audioFiles.length > 1}
                    required={audioFiles.length <= 1}
                />
            </div>

            <input type="text" name="artist" placeholder="Artist / Composer" value={formData.artist} onChange={handleChange} className="w-full p-3 bg-gray-800 rounded border border-gray-700" />
            <input type="text" name="singer" placeholder="Singer Name" value={formData.singer} onChange={handleChange} className="w-full p-3 bg-gray-800 rounded border border-gray-700" />
            <input type="text" name="movie" placeholder="Movie Name" value={formData.movie} onChange={handleChange} className="w-full p-3 bg-gray-800 rounded border border-gray-700" />
            <input type="text" name="album" placeholder="Album / Category" value={formData.album} onChange={handleChange} className="w-full p-3 bg-gray-800 rounded border border-gray-700" />
            
            <div className="flex flex-col gap-2">
                <label className="text-gray-400 text-sm">Audio Files (Select multiple for bulk upload)</label>
                <input 
                    id="audio-input"
                    type="file" 
                    name="audio" 
                    accept="audio/*" 
                    multiple 
                    onChange={handleFileChange} 
                    className="w-full p-2 bg-gray-800 rounded" 
                    required 
                />
                {audioFiles.length > 0 && <p className="text-xs text-green-500">{audioFiles.length} files selected</p>}
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-gray-400 text-sm">Cover Image (Common for all)</label>
                <input id="image-input" type="file" name="coverImage" accept="image/*" onChange={handleFileChange} className="w-full p-2 bg-gray-800 rounded" />
            </div>

            <button type="submit" disabled={uploading} className={`w-full bg-green-500 text-black font-bold py-3 rounded hover:bg-green-400 transition ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {uploading ? `Uploading ${audioFiles.length} Songs...` : 'Upload'}
            </button>
          </form>
    </div>
  );
};

export default AdminUpload;