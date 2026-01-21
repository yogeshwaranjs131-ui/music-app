import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Player from '../components/Player';
import { FaDownload, FaSearch, FaPlus, FaTimes, FaPlay } from 'react-icons/fa';
import api from '../api';

const Home = () => {
  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [isShuffle, setIsShuffle] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [songToAdd, setSongToAdd] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const initialLoad = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Fetch user, songs, and playlists in parallel
          const [userResponse, songsResponse, playlistsResponse] = await Promise.all([
            api.get('/auth/user'),
            api.get('/songs'),
            api.get('/playlists')
          ]);
          setUser(userResponse.data);
          setSongs(songsResponse.data);
          setUserPlaylists(playlistsResponse.data);
        } catch (error) {
          console.error('Failed to load initial data:', error);
          localStorage.removeItem('token');
          setUser(null); // Clear user state on error
        }
      } else {
        const songsResponse = await api.get('/songs').catch(err => console.error("Failed to fetch songs:", err));
        if (songsResponse) setSongs(songsResponse.data);
      }
    };
    initialLoad();
  }, []);

  const handlePlaySong = (song) => {
    console.log("Playing song:", song); 
    setCurrentSong(song);
  };

  const toggleShuffle = () => {
    setIsShuffle(!isShuffle);
  };

  const playNextSong = () => {
    if (currentSong && songs.length > 0) {
      // Use filtered list if searching, otherwise all songs
      const playlist = searchTerm ? filteredSongs : songs;
      if (isShuffle) {
        let nextIndex = Math.floor(Math.random() * playlist.length);
        // Prevent repeating the same song if possible
        if (playlist.length > 1) {
            const currentIndex = playlist.findIndex(song => song._id === currentSong._id);
            while (nextIndex === currentIndex) {
                nextIndex = Math.floor(Math.random() * playlist.length);
            }
        }
        setCurrentSong(playlist[nextIndex]);
      } else {
        const currentIndex = playlist.findIndex(song => song._id === currentSong._id);
        const nextIndex = (currentIndex + 1) % playlist.length; // Loop back to start
        setCurrentSong(playlist[nextIndex]);
      }
    }
  };

  const playPrevSong = () => {
    if (currentSong && songs.length > 0) {
      const currentIndex = songs.findIndex(song => song._id === currentSong._id);
      const prevIndex = (currentIndex - 1 + songs.length) % songs.length; // Loop to end
      setCurrentSong(songs[prevIndex]);
    }
  };

  const handleDownload = (e, song) => {
    e.stopPropagation(); // இதை கிளிக் செய்யும்போது பாடல் ப்ளே ஆவதை தடுக்கும்
    if (!song.audioUrl) return;

    const link = document.createElement('a');
    link.href = song.audioUrl;
    link.download = `${song.title} - ${song.artist}.mp3`; // டவுன்லோட் ஆகும் கோப்பின் பெயர்
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openPlaylistModal = (e, song) => {
    e.stopPropagation();
    setSongToAdd(song);
    setShowPlaylistModal(true);
  };

  const addToPlaylist = async (playlistId) => {
    try {
      await api.put(`/playlists/${playlistId}/songs`, { songId: songToAdd._id });
      setShowPlaylistModal(false);
      alert("Song added to playlist!");
    } catch (error) {
      console.error("Failed to add song", error);
    }
  };

  const filteredSongs = songs.filter((song) => {
    const term = searchTerm.toLowerCase();
    return (
      song.title.toLowerCase().includes(term) ||
      (song.artist && song.artist.toLowerCase().includes(term)) ||
      (song.singer && song.singer.toLowerCase().includes(term)) ||
      (song.movie && song.movie.toLowerCase().includes(term))
    );
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Night";
  };

  const greetingPlaylists = [
    { id: 'liked', name: 'Liked Songs', color: 'from-indigo-500 to-purple-500' },
    { id: 'mix1', name: 'Daily Mix 1', color: 'from-green-500 to-blue-500' },
    { id: 'mix2', name: 'Daily Mix 2', color: 'from-red-500 to-yellow-500' },
    { id: 'discover', name: 'Discover Weekly', color: 'from-pink-500 to-purple-500' },
    { id: 'tamil', name: 'Tamil Hits', color: 'from-orange-500 to-red-500' },
    { id: 'new', name: 'New Releases', color: 'from-teal-500 to-cyan-500' },
  ];

  return (
    <div className="h-screen bg-black flex flex-col">
      <div className="flex flex-1 overflow-hidden pb-20"> {/* pb-20 for player space */}
        <Sidebar playlists={userPlaylists} />
        
        <div className="flex-1 bg-linear-to-b from-gray-800 to-gray-900 overflow-y-auto rounded-lg m-2 ml-0 p-6 text-white">
            
            {/* Header */}
            <header className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 w-full max-w-md">
                    <FaSearch className="text-gray-400" />
                    <input
                        type="text"
                        placeholder="What do you want to play?"
                        className="bg-transparent border-none outline-none text-white w-full placeholder-gray-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {user ? (
                  <div className="relative">
                    <div 
                        className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center font-bold cursor-pointer"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-10">
                      <Link to="/profile" className="block px-4 py-2 text-sm text-white hover:bg-gray-700 cursor-pointer">Profile</Link>
                      <a onClick={handleLogout} className="block px-4 py-2 text-sm text-white hover:bg-gray-700 cursor-pointer">Logout</a>
                    </div>
                    )}
                  </div>
                ) : (
                  <Link to="/login" className="bg-white text-black font-bold py-2 px-4 rounded-full hover:bg-gray-200 transition whitespace-nowrap">
                    Log In
                  </Link>
                )}
            </header>

            {/* Greeting Grid */}
            <section className="mb-8">
                <h2 className="text-3xl font-bold mb-4">{getGreeting()}</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {greetingPlaylists.map((playlist) => (
                        <div key={playlist.id} className="bg-white/10 hover:bg-white/20 transition-colors duration-300 rounded-md flex items-center gap-4 cursor-pointer overflow-hidden group">
                            <div className={`w-16 h-16 bg-linear-to-br ${playlist.color} shadow-lg`}></div>
                            <span className="font-bold text-sm">{playlist.name}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Made For You Section */}
            <section>
                <h3 className="text-xl font-bold mb-4">{searchTerm ? 'Search Results' : 'Featured Songs'}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {filteredSongs.length > 0 ? (
                      filteredSongs.map((song) => (
                        <div key={song._id} className="bg-spotify-gray p-4 rounded-lg hover:bg-spotify-light-gray transition-all duration-300 group cursor-pointer" onClick={() => handlePlaySong(song)}>
                            <div className="relative w-full aspect-square mb-4">
                                <img src={song.coverImage || 'https://via.placeholder.com/150'} alt={song.title} className="w-full h-full object-cover rounded-md shadow-lg" />
                                <button className="absolute bottom-2 right-2 w-12 h-12 bg-spotify-green rounded-full flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 group-hover:bottom-4 transition-all duration-300">
                                    <FaPlay className="text-black text-xl ml-1" />
                                </button>
                            </div>
                            <div>
                                <h4 className="font-bold text-white truncate">{song.title}</h4>
                                <p className="text-sm text-spotify-subtext line-clamp-2 mt-1">{song.singer || song.artist}</p>
                            </div>
                        </div>
                    ))
                    ) : (
                      <p className="text-gray-400 col-span-full">No songs found matching "{searchTerm}"</p>
                    )}
                </div>
            </section>

            {/* Playlist Selection Modal */}
            {showPlaylistModal && (
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                <div className="bg-gray-900 p-6 rounded-lg w-80">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Add to Playlist</h3>
                    <FaTimes className="cursor-pointer" onClick={() => setShowPlaylistModal(false)} />
                  </div>
                  <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                    {userPlaylists.map(pl => (
                      <button key={pl._id} onClick={() => addToPlaylist(pl._id)} className="p-3 bg-gray-800 hover:bg-gray-700 rounded text-left truncate">
                        {pl.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>
      <Player 
        currentSong={currentSong} 
        onNext={playNextSong} 
        onPrev={playPrevSong} 
        onSongEnd={playNextSong}
        isShuffle={isShuffle}
        toggleShuffle={toggleShuffle}
        user={user}
        setUser={setUser}
      />
    </div>
  );
};

export default Home;