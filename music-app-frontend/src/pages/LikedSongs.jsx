import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Player from '../components/Player';
import api from '../api';
import { FaPlay, FaHeart } from 'react-icons/fa';

const LikedSongs = () => {
  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [user, setUser] = useState(null);
  const [isShuffle, setIsShuffle] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const [userRes, songsRes] = await Promise.all([
          api.get('/auth/user'),
          api.get('/songs')
        ]);
        
        const currentUser = userRes.data;
        setUser(currentUser);

        if (currentUser && currentUser.likedSongs && songsRes.data) {
          const liked = songsRes.data.filter(song => currentUser.likedSongs.includes(song._id));
          setSongs(liked);
        }
      } catch (error) {
        console.error('Failed to fetch liked songs:', error);
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            navigate('/login');
        }
      }
    };

    fetchData();
  }, [navigate, user?.likedSongs.length]); // Refetch when a song is liked/unliked

  const handlePlaySong = (song) => {
    setCurrentSong(song);
  };

  const toggleShuffle = () => setIsShuffle(!isShuffle);

  const playNextSong = () => {
    if (songs.length === 0) return;
    const currentIndex = songs.findIndex(song => song._id === currentSong?._id);
    if (isShuffle) {
        let nextIndex = Math.floor(Math.random() * songs.length);
        if (songs.length > 1) {
            while (nextIndex === currentIndex) {
                nextIndex = Math.floor(Math.random() * songs.length);
            }
        }
        setCurrentSong(songs[nextIndex]);
    } else {
        const nextIndex = (currentIndex + 1) % songs.length;
        setCurrentSong(songs[nextIndex]);
    }
  };

  const playPrevSong = () => {
    if (songs.length === 0) return;
    const currentIndex = songs.findIndex(song => song._id === currentSong?._id);
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    setCurrentSong(songs[prevIndex]);
  };

  return (
    <div className="h-screen bg-black flex flex-col">
      <div className="flex flex-1 overflow-hidden pb-20">
        <Sidebar />
        <div className="flex-1 bg-linear-to-b from-purple-800 via-gray-900 to-black overflow-y-auto rounded-lg m-2 ml-0 p-6 text-white">
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
                    {song.coverImage && <img src={song.coverImage} alt={song.title} className="w-full h-full object-cover rounded" />}
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
      </div>
      <Player currentSong={currentSong} onNext={playNextSong} onPrev={playPrevSong} onSongEnd={playNextSong} isShuffle={isShuffle} toggleShuffle={toggleShuffle} user={user} setUser={setUser} />
    </div>
  );
};

export default LikedSongs;