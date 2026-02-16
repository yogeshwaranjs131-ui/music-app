import React, { createContext, useState, useContext } from 'react';

const PlayerContext = createContext();

export const usePlayer = () => useContext(PlayerContext);

export const PlayerProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [queue, setQueue] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);

  const playSong = (song, songList = []) => {
    setCurrentSong(song);
    if (songList.length > 0) {
        setQueue(songList);
    }
    setIsPlaying(true);
  };

  const pauseSong = () => {
    setIsPlaying(false);
  };

  return (
    <PlayerContext.Provider value={{ currentSong, queue, isPlaying, playSong, pauseSong }}>
      {children}
    </PlayerContext.Provider>
  );
};