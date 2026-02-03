import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaDownload, FaSearch, FaPlus, FaTimes, FaPlay, FaComment, FaShareAlt, FaFacebook, FaTwitter, FaWhatsapp, FaHeart, FaInstagram, FaTrash } from 'react-icons/fa';
import api from '../api';
import { useAuth } from './AuthContext';
import { usePlayer } from './PlayerContext';
import CommentModal from '../components/CommentModal';

const Home = () => {
  const [songs, setSongs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { user, setUser, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [songToAdd, setSongToAdd] = useState(null);
  const [activeCommentSong, setActiveCommentSong] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [songToShare, setSongToShare] = useState(null);
  const navigate = useNavigate();
  const { playSong } = usePlayer();
  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Helper function to format image URLs correctly
  const getImageUrl = (path) => {
    if (!path) return 'https://via.placeholder.com/150';
    if (path.startsWith('http')) return path;
    // Replace backslashes with forward slashes for Windows paths
    const cleanPath = path.replace(/\\/g, '/');
    return `${backendUrl}/${cleanPath.startsWith('/') ? cleanPath.slice(1) : cleanPath}`;
  };

  useEffect(() => {
    // Fetch all songs, regardless of login status
    api.get('/songs')
      .then(response => setSongs(response.data))
      .catch(err => console.error("Failed to fetch songs:", err));

    // If user is logged in (from AuthContext), fetch their playlists
    if (user) {
      api.get('/playlists')
        .then(response => {
          setUserPlaylists(response.data);
        })
        .catch(err => console.error("Failed to fetch user playlists:", err));
    }
  }, [user]); // This effect re-runs when the user logs in or out

  const handlePlaySong = (song) => {
    // Play the selected song and provide the current filtered list as the queue
    playSong(song, filteredSongs);
  };

  const handleDownload = (e, song) => {
    e.stopPropagation(); // Stop the song from playing when the download button is clicked
    if (!song.audioUrl) return;

    const link = document.createElement('a');
    link.href = song.audioUrl;
    link.download = `${song.title} - ${song.artist}.mp3`; // The filename for the download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLike = async (e, song) => {
    e.stopPropagation();
    if (!user) {
        alert("Please login to like songs");
        return;
    }
    try {
      const response = await api.put(`/auth/favorites/${song._id}`);
      setUser(response.data);
    } catch (error) {
      console.error("Failed to like song", error);
    }
  };

  const openPlaylistModal = (e, song) => {
    e.stopPropagation();
    setSongToAdd(song);
    setShowPlaylistModal(true);
  };

  const openShare = (e, song) => {
    e.stopPropagation();
    setSongToShare(song);
    setShowShareModal(true);
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

  const handleDeleteSong = async (e, songId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this song?")) return;

    try {
      await api.delete(`/auth/songs/${songId}`);
      setSongs(songs.filter(song => song._id !== songId));
      alert("Song deleted successfully");
    } catch (error) {
      console.error("Failed to delete song", error);
      alert("Failed to delete song");
    }
  };

  const filteredSongs = songs.filter((song) => {
    const term = searchTerm.toLowerCase();
    return (
      (song.title && song.title.toLowerCase().includes(term)) ||
      (song.artist && song.artist.toLowerCase().includes(term)) ||
      (song.singer && song.singer.toLowerCase().includes(term)) ||
      (song.movie && song.movie.toLowerCase().includes(term))
    );
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Night";
  };

  const handleGreetingClick = (id) => {
    if (id === 'liked') {
      navigate('/collection/tracks');
    } else if (id === 'tamil') {
      setSearchTerm('Tamil');
    }
  };



  return (
    <>
      {/* The main layout is now handled by MainLayout.jsx, so we only need the page content here */}
            
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
                        className="w-8 h-8 rounded-full flex items-center justify-center font-bold cursor-pointer bg-gray-700"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                      {user.profileImage ? (
                        <img src={getImageUrl(user.profileImage)} alt={user.username} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        user.username.charAt(0).toUpperCase()
                      )}
                    </div>
                    {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-10">
                      <Link to="/profile" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-white hover:bg-gray-700 cursor-pointer">Profile</Link>
                      <a onClick={() => { logout(); navigate('/login'); }} className="block px-4 py-2 text-sm text-white hover:bg-gray-700 cursor-pointer">Logout</a>
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
                        <div key={playlist.id} onClick={() => handleGreetingClick(playlist.id)} className="bg-white/10 hover:bg-white/20 transition-colors duration-300 rounded-md flex items-center gap-4 cursor-pointer overflow-hidden group">
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
                                <img src={getImageUrl(song.coverImage)} alt={song.title} className="w-full h-full object-cover rounded-md shadow-lg" />
                                <button className="absolute bottom-2 right-2 w-12 h-12 bg-spotify-green rounded-full flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 group-hover:bottom-4 transition-all duration-300">
                                    <FaPlay className="text-black text-xl ml-1" />
                                </button>
                            </div>
                            <div>
                                <h4 className="font-bold text-white truncate">{song.title}</h4>
                                <p className="text-sm text-spotify-subtext line-clamp-2 mt-1">{song.singer || song.artist}</p>
                            </div>
                            
                            {/* Action Buttons Row */}
                            <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-700">
                                <button onClick={(e) => handleLike(e, song)} className={`text-gray-400 hover:text-red-500 transition ${user?.likedSongs?.includes(song._id) ? 'text-red-500' : ''}`} title="Like">
                                    <FaHeart />
                                </button>
                                <button onClick={(e) => handleDownload(e, song)} className="text-gray-400 hover:text-green-500 transition" title="Download">
                                    <FaDownload />
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); setActiveCommentSong(song); }} className="text-gray-400 hover:text-blue-400 transition" title="Comments">
                                    <FaComment />
                                </button>
                                <button onClick={(e) => openPlaylistModal(e, song)} className="text-gray-400 hover:text-white transition" title="Add to Playlist">
                                    <FaPlus />
                                </button>
                                <button onClick={(e) => openShare(e, song)} className="text-gray-400 hover:text-pink-500 transition" title="Share">
                                    <FaShareAlt />
                                </button>
                                <button onClick={(e) => handleDeleteSong(e, song._id)} className="text-gray-400 hover:text-red-600 transition" title="Delete">
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                    ))
                    ) : (
                      songs.length === 0 ? (
                        <div className="col-span-full text-center py-10">
                            <p className="text-gray-400 mb-4 text-lg">No songs available yet.</p>
                            <Link to="/admin/upload" className="bg-green-500 text-black px-6 py-2 rounded-full font-bold hover:bg-green-400 transition">Upload Songs</Link>
                        </div>
                      ) : (
                        <p className="text-gray-400 col-span-full">No songs found matching "{searchTerm}"</p>
                      )
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

            {/* Comment Modal */}
            {activeCommentSong && (
              <CommentModal song={activeCommentSong} user={user} onClose={() => setActiveCommentSong(null)} />
            )}

            {/* Share Modal */}
            {showShareModal && songToShare && (
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setShowShareModal(false)}>
                <div className="bg-gray-900 p-6 rounded-lg w-80 text-center" onClick={e => e.stopPropagation()}>
                  <h3 className="text-xl font-bold mb-4">Share "{songToShare.title}"</h3>
                  <div className="flex justify-center gap-6 mb-6">
                    <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:scale-110 transition">
                      <FaFacebook size={32} />
                    </a>
                    <a href={`https://twitter.com/intent/tweet?text=Check out this song: ${songToShare.title}&url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:scale-110 transition">
                      <FaTwitter size={32} />
                    </a>
                    <a href={`https://api.whatsapp.com/send?text=Check out ${songToShare.title} on MusicStream!`} target="_blank" rel="noopener noreferrer" className="text-green-500 hover:scale-110 transition">
                      <FaWhatsapp size={32} />
                    </a>
                    <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:scale-110 transition">
                      <FaInstagram size={32} />
                    </a>
                  </div>
                  <button onClick={() => setShowShareModal(false)} className="text-gray-400 hover:text-white text-sm">Close</button>
                </div>
              </div>
            )}
    </>
  );
};

export default Home;