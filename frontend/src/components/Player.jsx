import React, { useState, useEffect } from 'react';
import { usePlayer } from '../pages/PlayerContext';
import { useAuth } from '../pages/AuthContext';
import { FaPlay, FaPause, FaStepForward, FaStepBackward, FaRandom, FaRedo, FaVolumeUp, FaHeart } from 'react-icons/fa';
import api from '../api';

const Player = () => {
  const {
    currentSong,
    isPlaying,
    isShuffle,
    audioRef,
    togglePlayPause,
    playNext,
    playPrev,
    toggleShuffle,
  } = usePlayer();
  const { user, setUser } = useAuth();
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (user && currentSong) {
      setIsLiked(user.likedSongs.includes(currentSong._id));
    }
  }, [user, currentSong]);

  const handleTimeUpdate = () => {
    setProgress(audioRef.current.currentTime);
  };

  const handleLoadedData = () => {
    setDuration(audioRef.current.duration);
  };

  const handleProgressChange = (e) => {
    audioRef.current.currentTime = e.target.value;
    setProgress(e.target.value);
  };
  
  const handleVolumeChange = (e) => {
    const newVolume = e.target.value;
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleLike = async () => {
    if (!user || !currentSong) return;
    try {
      const response = await api.put(`/auth/favorites/${currentSong._id}`);
      setUser(response.data); // Update user in context
      setIsLiked(!isLiked);
    } catch (error) {
      console.error("Failed to like song", error);
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  if (!currentSong) {
    return <div className="fixed bottom-0 left-0 right-0 h-20 bg-gray-900 z-50" />; // Return an empty player bar
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-gray-900 text-white flex md:grid md:grid-cols-3 items-center px-4 z-50 border-t border-gray-800 justify-between">
      <audio
        ref={audioRef}
        src={currentSong.audioUrl?.startsWith('http') ? currentSong.audioUrl : `${backendUrl}${currentSong.audioUrl}`}
        onEnded={playNext}
        onTimeUpdate={handleTimeUpdate}
        onLoadedData={handleLoadedData}
      />
      
      <div className="flex items-center gap-3 w-full md:w-auto overflow-hidden mr-2">
        <img src={currentSong.coverImage ? (currentSong.coverImage.startsWith('http') ? currentSong.coverImage : `${backendUrl}${currentSong.coverImage}`) : 'https://via.placeholder.com/150'} alt={currentSong.title} className="w-12 h-12 md:w-14 md:h-14 object-cover rounded shrink-0" />
        <div className="overflow-hidden min-w-0">
          <p className="font-semibold truncate text-sm md:text-base">{currentSong.title}</p>
          <p className="text-xs md:text-sm text-gray-400 truncate">{currentSong.singer || currentSong.artist}</p>
        </div>
        {user && (
            <button onClick={handleLike} className="ml-2 md:ml-4 shrink-0">
                <FaHeart className={isLiked ? 'text-green-500' : 'text-gray-400 hover:text-white'} />
            </button>
        )}
      </div>

      <div className="flex flex-col items-center justify-center md:w-auto">
        <div className="flex items-center gap-2 md:gap-4">
          <button onClick={toggleShuffle} className={`hidden md:block ${isShuffle ? 'text-green-500' : 'text-gray-400 hover:text-white'}`}> <FaRandom size={16} /> </button>
          <button onClick={playPrev} className="text-gray-400 hover:text-white"> <FaStepBackward size={20} /> </button>
          <button onClick={togglePlayPause} className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center hover:scale-105">
            {isPlaying ? <FaPause size={14} /> : <FaPlay size={14} className="ml-0.5" />}
          </button>
          <button onClick={playNext} className="text-gray-400 hover:text-white"> <FaStepForward size={20} /> </button>
          <button className="hidden md:block text-gray-400 hover:text-white"> <FaRedo size={16} /> </button>
        </div>
        <div className="flex items-center gap-2 w-32 md:w-full max-w-md mt-1">
            <span className="text-xs text-gray-400 hidden md:inline">{formatTime(progress)}</span>
            <input type="range" min="0" max={duration || 0} value={progress} onChange={handleProgressChange} className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer range-sm" />
            <span className="text-xs text-gray-400 hidden md:inline">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="hidden md:flex items-center justify-end gap-2">
        <FaVolumeUp />
        <input type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolumeChange} className="w-24 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer range-sm" />
      </div>
    </div>
  );
};

export default Player;