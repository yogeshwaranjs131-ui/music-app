import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Player from '../components/Player';
import api from '../api';
import { FaPlay, FaMusic } from 'react-icons/fa';

const PlaylistPage = () => {
  const [playlist, setPlaylist] = useState(null);
  const [currentSong, setCurrentSong] = useState(null);
  const [user, setUser] = useState(null);
  const [isShuffle, setIsShuffle] = useState(false);
  const { id } = useParams();
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
        console.error('Could not fetch user', error);
        localStorage.removeItem('token');
        navigate('/login');
      }
    };
    fetchUser();
  }, [navigate]);

  useEffect(() => {
    if (id) {
      const fetchPlaylist = async () => {
        try {
          const response = await api.get(`/playlists/${id}`);
          setPlaylist(response.data);
        } catch (error) {
          console.error('Failed to fetch playlist:', error);
          navigate('/'); // Redirect to home if playlist not found or not authorized
        }
      };
      fetchPlaylist();
    }
  }, [id, navigate]);

  const handlePlaySong = (song) => {
    setCurrentSong(song);
  };

  const toggleShuffle = () => setIsShuffle(!isShuffle);

  const playNextSong = () => {
    if (!playlist || playlist.songs.length === 0) return;
    const songs = playlist.songs;
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
    if (!playlist || playlist.songs.length === 0) return;
    const songs = playlist.songs;
    const currentIndex = songs.findIndex(song => song._id === currentSong?._id);
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    setCurrentSong(songs[prevIndex]);
  };

  if (!playlist) {
    return <div className="h-screen bg-black text-white flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="h-screen bg-black flex flex-col">
      <div className="flex flex-1 overflow-hidden pb-20">
        <Sidebar />
        <div className="flex-1 bg-linear-to-b from-gray-800 via-gray-900 to-black overflow-y-auto rounded-lg m-2 ml-0 p-6 text-white">
          <header className="flex items-end gap-6 mb-8">
            <div className="w-32 h-32 md:w-48 md:h-48 bg-gray-800 flex items-center justify-center rounded shadow-lg">
              <FaMusic size={80} className="text-gray-500"/>
            </div>
            <div>
              <p className="text-sm font-bold">Playlist</p>
              <h1 className="text-5xl md:text-7xl font-extrabold">{playlist.name}</h1>
              {playlist.owner && <p className="mt-4 text-sm text-gray-300">{playlist.owner.username} • {playlist.songs.length} songs</p>}
            </div>
          </header>

          <section>
            {playlist.songs.map((song, index) => (
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
            {playlist.songs.length === 0 && <p className="text-gray-400 mt-8 px-2">This playlist is empty. Let's add some songs!</p>}
          </section>
        </div>
      </div>
      <Player currentSong={currentSong} onNext={playNextSong} onPrev={playPrevSong} onSongEnd={playNextSong} isShuffle={isShuffle} toggleShuffle={toggleShuffle} user={user} setUser={setUser} />
    </div>
  );
};

export default PlaylistPage;