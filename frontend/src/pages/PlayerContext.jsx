import React, { createContext, useState, useContext, useRef, useEffect } from 'react';

const PlayerContext = createContext();

export const usePlayer = () => useContext(PlayerContext);

export const PlayerProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [queue, setQueue] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off'); // off, one, all
  const [sleepTimer, setSleepTimer] = useState(null);
  const audioRef = useRef(null);

  const playSong = (song, songList = []) => {
    setCurrentSong(song);
    if (songList.length > 0) {
        setQueue(songList);
    }
    setIsPlaying(true);
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      audioRef.current?.play();
      setIsPlaying(true);
    }
  };

  const playNext = (auto = false) => {
    if (!currentSong || queue.length === 0) return;

    if (repeatMode === 'one' && auto) {
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
        }
        return;
    }

    const currentIndex = queue.findIndex(s => s._id === currentSong._id);
    let nextIndex;

    if (isShuffle) {
        nextIndex = Math.floor(Math.random() * queue.length);
    } else {
        nextIndex = currentIndex + 1;
    }

    if (nextIndex >= queue.length) {
        if (repeatMode === 'all') {
            nextIndex = 0;
        } else {
            setIsPlaying(false);
            return;
        }
    }

    setCurrentSong(queue[nextIndex]);
    setIsPlaying(true);
  };

  const playPrev = () => {
    if (!currentSong || queue.length === 0) return;
    const currentIndex = queue.findIndex(s => s._id === currentSong._id);
    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) prevIndex = queue.length - 1;
    setCurrentSong(queue[prevIndex]);
    setIsPlaying(true);
  };

  const toggleShuffle = () => setIsShuffle(!isShuffle);
  
  const toggleRepeat = () => {
      setRepeatMode(prev => prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off');
  };

  const startSleepTimer = (minutes) => {
      setSleepTimer(minutes);
  };

  useEffect(() => {
      if (sleepTimer) {
          const timer = setTimeout(() => {
              setIsPlaying(false);
              audioRef.current?.pause();
              setSleepTimer(null);
          }, sleepTimer * 60 * 1000);
          return () => clearTimeout(timer);
      }
  }, [sleepTimer]);

  return (
    <PlayerContext.Provider value={{ 
        currentSong, 
        queue, 
        isPlaying, 
        setIsPlaying,
        playSong, 
        audioRef,
        togglePlayPause,
        playNext,
        playPrev,
        isShuffle,
        toggleShuffle,
        repeatMode,
        toggleRepeat,
        sleepTimer,
        startSleepTimer
    }}>
      {children}
    </PlayerContext.Provider>
  );
};