import { useState } from 'react';
import { uploadSong } from '../api';

const AdminUpload = () => {
  const [songData, setSongData] = useState({
    title: '',
    artist: '',
    album: '',
    genre: ''
  });
  const [audioFile, setAudioFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setSongData({ ...songData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.name === 'audio') {
      setAudioFile(e.target.files[0]);
    } else if (e.target.name === 'image') {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('title', songData.title);
    formData.append('artist', songData.artist);
    formData.append('album', songData.album);
    formData.append('genre', songData.genre);
    if (audioFile) formData.append('audio', audioFile);
    if (imageFile) formData.append('coverImage', imageFile);

    try {
      await uploadSong(formData);
      setMessage('Song uploaded successfully!');
      setSongData({ title: '', artist: '', album: '', genre: '' });
      setAudioFile(null);
      setImageFile(null);
      // Reset file inputs
      document.getElementById('audio-upload').value = '';
      document.getElementById('image-upload').value = '';
    } catch (error) {
      console.error('Upload error:', error);
      setMessage('Failed to upload song. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Upload New Song</h2>
      
      {message && (
        <div className={`p-3 mb-4 rounded ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-1">Title</label>
          <input
            type="text"
            name="title"
            placeholder="Song Title"
            value={songData.title}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Artist</label>
          <input
            type="text"
            name="artist"
            placeholder="Artist Name"
            value={songData.artist}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Album</label>
            <input
              type="text"
              name="album"
              placeholder="Album Name"
              value={songData.album}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Genre</label>
            <input
              type="text"
              name="genre"
              placeholder="Genre"
              value={songData.genre}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Audio File</label>
          <input
            type="file"
            name="audio"
            id="audio-upload"
            accept="audio/*"
            onChange={handleFileChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Cover Image</label>
          <input
            type="file"
            name="image"
            id="image-upload"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded-lg text-white font-bold transition duration-300 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {loading ? 'Uploading...' : 'Upload Song'}
        </button>
      </form>
    </div>
  );
};

export default AdminUpload;