import React, { createContext, useState, useContext, useRef, useEffect } from 'react';

const PlayerContext = createContext(null);

export const PlayerProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [queue, setQueue] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const audioRef = useRef(null);
  const [sleepTimer, setSleepTimer] = useState(null);
  const timerRef = useRef(null);
  const [repeatMode, setRepeatMode] = useState('off'); // 'off', 'all', 'one'

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Audio play failed:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentSong]);

  const playSong = (song, songQueue = []) => {
    setCurrentSong(song);
    setQueue(songQueue.length > 0 ? songQueue : [song]);
    setIsPlaying(true);

    // Add to Recently Played (Local Storage)
    try {
      const saved = localStorage.getItem('recentlyPlayed');
      let recent = saved ? JSON.parse(saved) : [];
      if (!Array.isArray(recent)) recent = [];
      recent = recent.filter(s => s && s._id !== song._id); // Remove duplicates
      recent.unshift(song); // Add to top
      if (recent.length > 10) recent = recent.slice(0, 10); // Keep only last 10
      localStorage.setItem('recentlyPlayed', JSON.stringify(recent));
    } catch (err) {
      console.error("Error saving recently played", err);
    }
  };

  const togglePlayPause = () => {
    if (currentSong) {
      setIsPlaying(!isPlaying);
    }
  };

  const playNext = (auto = false) => {
    if (queue.length === 0) return;
    const currentIndex = queue.findIndex(s => s._id === currentSong?._id);
    let nextIndex;

    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
      if (queue.length > 1) {
        while (nextIndex === currentIndex) {
          nextIndex = Math.floor(Math.random() * queue.length);
        }
      }
    } else {
      // If Repeat is OFF and it's an auto-play (song ended), stop at the last song.
      if (auto && repeatMode === 'off' && currentIndex === queue.length - 1) {
        setIsPlaying(false);
        return;
      }
      nextIndex = (currentIndex + 1) % queue.length;
    }
    setCurrentSong(queue[nextIndex]);
    setIsPlaying(true);
  };

  const playPrev = () => {
    if (queue.length === 0) return;
    const currentIndex = queue.findIndex(s => s._id === currentSong?._id);
    const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
    setCurrentSong(queue[prevIndex]);
    setIsPlaying(true);
  };

  const toggleShuffle = () => setIsShuffle(!isShuffle);

  const toggleRepeat = () => {
    if (repeatMode === 'off') setRepeatMode('all');
    else if (repeatMode === 'all') setRepeatMode('one');
    else setRepeatMode('off');
  };

  const startSleepTimer = (minutes) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    
    if (!minutes) {
      setSleepTimer(null);
      return;
    }

    setSleepTimer(minutes);
    timerRef.current = setTimeout(() => {
      setIsPlaying(false);
      setSleepTimer(null);
    }, minutes * 60 * 1000);
  };

  const value = { currentSong, queue, isPlaying, setIsPlaying, isShuffle, repeatMode, audioRef, sleepTimer, playSong, togglePlayPause, playNext, playPrev, toggleShuffle, toggleRepeat, startSleepTimer };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
};

export const usePlayer = () => {
  return useContext(PlayerContext);
};