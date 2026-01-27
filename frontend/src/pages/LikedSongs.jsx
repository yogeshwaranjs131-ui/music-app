import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { FaPlay, FaHeart } from 'react-icons/fa';
import { useAuth } from './AuthContext';
import { usePlayer } from './PlayerContext';

const LikedSongs = () => {
  const [songs, setSongs] = useState([]);
  const { user, loading } = useAuth();
  const { playSong } = usePlayer();
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Helper function to format image URLs correctly
  const getImageUrl = (path) => {
    if (!path) return 'https://via.placeholder.com/150';
    if (path.startsWith('http')) return path;
    const cleanPath = path.replace(/\\/g, '/');
    return `${backendUrl}/${cleanPath.startsWith('/') ? cleanPath.slice(1) : cleanPath}`;
  };

  useEffect(() => {
    // Redirect if not logged in
    if (!loading && !user) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      if (user) {
        try {
          // Fetch liked songs directly from the new, efficient endpoint
          const response = await api.get('/playlists/favorites');
          setSongs(response.data);
        } catch (error) {
          console.error('Failed to fetch liked songs:', error);
          setSongs([]); // Clear songs on error
        }
      }
    };

    fetchData();
  }, [user, loading, navigate]);

  const handlePlaySong = (song) => {
    playSong(song, songs);
  };

  return (
    <div className="bg-linear-to-b from-purple-800 via-gray-900 to-black">
          <header className="flex items-end gap-6 mb-8">
            <div className="w-32 h-32 md:w-48 md:h-48 bg-linear-to-br from-purple-600 to-indigo-400 flex items-center justify-center rounded shadow-lg">
              <FaHeart size={80} className="text-white"/>
            </div>
            <div>
              <p className="text-sm font-bold">Playlist</p>
              <h1 className="text-5xl md:text-7xl font-extrabold">Liked Songs</h1>
              {user && <p className="mt-4 text-sm text-gray-300">{user.username} • {songs.length} songs</p>}
            </div>
          </header>

          <section>
            {songs.map((song, index) => (
              <div key={song._id} className="grid grid-cols-[auto,1fr,auto] items-center gap-4 p-2 rounded-md hover:bg-white/10 group cursor-pointer" onDoubleClick={() => handlePlaySong(song)}>
                <div className="text-gray-400 w-8 text-center">{index + 1}</div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-700 rounded shrink-0">
                    {song.coverImage && <img src={getImageUrl(song.coverImage)} alt={song.title} className="w-full h-full object-cover rounded" />}
                  </div>
                  <div>
                    <p className="font-semibold">{song.title}</p>
                    <p className="text-sm text-gray-400">{song.singer || song.artist}</p>
                  </div>
                </div>
                <div className="text-right">
                  <button onClick={() => handlePlaySong(song)} className="opacity-0 group-hover:opacity-100 transition-opacity text-white p-2">
                    <FaPlay size={18} />
                  </button>
                </div>
              </div>
            ))}
            {songs.length === 0 && <p className="text-gray-400 mt-8 px-2">Songs you like will appear here.</p>}
          </section>
    </div>
  );
};

export default LikedSongs;