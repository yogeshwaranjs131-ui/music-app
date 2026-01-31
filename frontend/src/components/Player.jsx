import React, { useState, useEffect } from 'react';
import { usePlayer } from '../pages/PlayerContext';
import { useAuth } from '../pages/AuthContext';
import { FaPlay, FaPause, FaStepForward, FaStepBackward, FaRandom, FaRedo, FaVolumeUp, FaVolumeDown, FaVolumeMute, FaHeart, FaClock, FaList } from 'react-icons/fa';
import api from '../api';

const Player = () => {
  const {
    currentSong,
    queue,
    playSong,
    isPlaying,
    setIsPlaying,
    isShuffle,
    audioRef,
    togglePlayPause,
    playNext,
    playPrev,
    toggleShuffle,
    startSleepTimer,
    sleepTimer,
    repeatMode,
    toggleRepeat
  } = usePlayer();
  const { user, setUser } = useAuth();
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [prevVolume, setPrevVolume] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (user && currentSong) {
      setIsLiked(user.likedSongs.includes(currentSong._id));
    }
  }, [user, currentSong]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      switch(e.code) {
        case 'Space':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'ArrowRight':
          if (e.ctrlKey || e.metaKey) playNext();
          break;
        case 'ArrowLeft':
          if (e.ctrlKey || e.metaKey) playPrev();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlayPause, playNext, playPrev]);

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
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    if (newVolume > 0) {
      setPrevVolume(newVolume);
    }
  };

  const toggleMute = () => {
    if (volume > 0) {
      setVolume(0);
      if (audioRef.current) audioRef.current.volume = 0;
    } else {
      // Restore previous volume
      const vol = prevVolume || 1;
      setVolume(vol);
      if (audioRef.current) audioRef.current.volume = vol;
    }
  };

  const getAudioUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const cleanPath = path.replace(/\\/g, '/');
    return `${backendUrl}/${cleanPath.startsWith('/') ? cleanPath.slice(1) : cleanPath}`;
  };

  const getImageUrl = (path) => {
    if (!path) return 'https://via.placeholder.com/150';
    if (path.startsWith('http')) return path;
    const cleanPath = path.replace(/\\/g, '/');
    return `${backendUrl}/${cleanPath.startsWith('/') ? cleanPath.slice(1) : cleanPath}`;
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

  const cycleTimer = () => {
    if (!sleepTimer) startSleepTimer(15);
    else if (sleepTimer === 15) startSleepTimer(30);
    else if (sleepTimer === 30) startSleepTimer(60);
    else startSleepTimer(null);
  };

  const handleAudioError = () => {
    setIsPlaying(false);
    alert("Cannot play this song. The link might be broken or not supported.");
  };

  if (!currentSong) {
    return <div className="fixed bottom-0 left-0 right-0 h-20 bg-gray-900 z-50" />; // Return an empty player bar
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-gray-900 text-white flex md:grid md:grid-cols-3 items-center px-4 z-50 border-t border-gray-800 justify-between">
      <audio
        ref={audioRef}
        src={getAudioUrl(currentSong.audioUrl)}
        loop={repeatMode === 'one'}
        onEnded={() => playNext(true)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedData={handleLoadedData}
        onError={handleAudioError}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
      />
      
      <div className="flex items-center gap-3 w-full md:w-auto overflow-hidden mr-2">
        <img src={getImageUrl(currentSong.coverImage)} alt={currentSong.title} className="w-12 h-12 md:w-14 md:h-14 object-cover rounded shrink-0" />
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
          <button onClick={() => playNext(false)} className="text-gray-400 hover:text-white"> <FaStepForward size={20} /> </button>
          <button onClick={toggleRepeat} className={`hidden md:block ${repeatMode !== 'off' ? 'text-green-500' : 'text-gray-400 hover:text-white'} relative`}> 
            <FaRedo size={16} />
            {repeatMode === 'one' && <span className="absolute -top-1 -right-2 text-[10px] font-bold">1</span>}
          </button>
          <button onClick={cycleTimer} className={`hidden md:block ${sleepTimer ? 'text-green-500' : 'text-gray-400 hover:text-white'} relative`} title="Sleep Timer">
            <FaClock size={16} />
            {sleepTimer && <span className="absolute -top-2 -right-2 text-[10px] font-bold bg-gray-900 rounded-full px-1">{sleepTimer}m</span>}
          </button>
        </div>
        <div className="flex items-center gap-2 w-32 md:w-full max-w-md mt-1">
            <span className="text-xs text-gray-400 hidden md:inline">{formatTime(progress)}</span>
            <input type="range" min="0" max={duration || 0} value={progress} onChange={handleProgressChange} className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer range-sm" />
            <span className="text-xs text-gray-400 hidden md:inline">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="hidden md:flex items-center justify-end gap-2">
        <button onClick={toggleMute} className="text-gray-400 hover:text-white">
          {volume === 0 ? <FaVolumeMute /> : volume < 0.5 ? <FaVolumeDown /> : <FaVolumeUp />}
        </button>
        <input type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolumeChange} className="w-24 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer range-sm" />
        <button onClick={() => setShowQueue(!showQueue)} className={`ml-2 text-gray-400 hover:text-white ${showQueue ? 'text-green-500' : ''}`} title="Queue">
          <FaList />
        </button>
      </div>

      {/* Queue Popup */}
      {showQueue && (
        <div className="absolute bottom-24 right-4 w-72 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl max-h-96 overflow-y-auto p-4 z-50">
          <h3 className="text-white font-bold mb-4 sticky top-0 bg-gray-900 py-2 border-b border-gray-800">Queue</h3>
          <div className="space-y-2">
            {queue.map((song, index) => (
              <div key={index} onClick={() => playSong(song, queue)} className={`flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-gray-800 ${currentSong._id === song._id ? 'text-green-500' : 'text-gray-300'}`}>
                <span className="text-xs w-4">{index + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{song.title}</p>
                  <p className="truncate text-xs text-gray-500">{song.artist}</p>
                </div>
                {currentSong._id === song._id && <FaPlay size={10} />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Player;