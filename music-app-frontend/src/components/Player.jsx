import React, { useState, useRef, useEffect } from 'react';
import { FaPlayCircle, FaPauseCircle, FaStepBackward, FaStepForward, FaVolumeUp, FaVolumeDown, FaVolumeOff, FaDownload, FaHeart, FaRegHeart, FaRandom, FaRedo, FaListUl, FaLaptop, FaComment, FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';
import api from '../api';
import CommentModal from './CommentModal';

const Player = ({ currentSong, onNext, onPrev, onSongEnd, isShuffle, toggleShuffle, user, setUser }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isDraggingProgress, setIsDraggingProgress] = useState(false);
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const audioRef = useRef(null);
  const progressRef = useRef(null);
  const volumeRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (currentSong && audio) {
      audio.src = currentSong.audioUrl;
      audio.load();
      audio.play().catch(e => console.error("Playback error:", e));
      
      if (user && user.likedSongs) {
        setIsLiked(user.likedSongs.includes(currentSong._id));
      } else {
        setIsLiked(false);
      }
    }
  }, [currentSong, user]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDraggingProgress) updateProgress(e);
      if (isDraggingVolume) updateVolume(e);
    };
    const handleMouseUp = () => {
      setIsDraggingProgress(false);
      setIsDraggingVolume(false);
    };

    if (isDraggingProgress || isDraggingVolume) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingProgress, isDraggingVolume]);

  const togglePlayPause = () => {
    if (!currentSong) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.error("Playback error:", e));
    }
  };

  const handleDownload = async () => {
    if (!currentSong || !currentSong.audioUrl) return;

    try {
      const response = await fetch(currentSong.audioUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${currentSong.title} - ${currentSong.singer || currentSong.artist}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      const link = document.createElement('a');
      link.href = currentSong.audioUrl;
      link.download = `${currentSong.title} - ${currentSong.singer || currentSong.artist}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const toggleLike = async () => {
    if (!user) {
      alert("Please login to like songs");
      return;
    }
    try {
      const response = await api.put(`/auth/favorites/${currentSong._id}`);
      setUser(response.data);
    } catch (error) {
      console.error("Error liking song:", error);
    }
  };

  const handleShare = (platform) => {
    if (!currentSong) return;
    const text = `Listening to ${currentSong.title}`;
    const url = window.location.href;

    if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`, '_blank');
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'instagram') {
      alert("Share on Instagram!");
    }
  };

  const toggleRepeat = () => {
    setIsRepeat(!isRepeat);
  };

  const updateVolume = (e) => {
    const volumeBar = volumeRef.current;
    if (!volumeBar) return;
    const { left, width } = volumeBar.getBoundingClientRect();
    const clickX = e.clientX - left;
    let newVolume = clickX / width;
    if (newVolume < 0) newVolume = 0;
    if (newVolume > 1) newVolume = 1;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => setIsMuted(!isMuted);

  const updateProgress = (e) => {
    if (!duration) return;
    const progressContainer = progressRef.current;
    const { left, width } = progressContainer.getBoundingClientRect();
    const clickPositionX = e.clientX - left;
    const percentage = Math.max(0, Math.min(1, clickPositionX / width));
    audioRef.current.currentTime = duration * percentage;
  };

  const handleProgressMouseDown = (e) => {
    setIsDraggingProgress(true);
    updateProgress(e);
  };

  const handleVolumeMouseDown = (e) => {
    setIsDraggingVolume(true);
    updateVolume(e);
  };

  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds) || timeInSeconds < 0) return '0:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  return (
    <>
      <div className="h-20 bg-black text-white border-t border-gray-800 flex items-center justify-between px-4 fixed bottom-0 w-full z-50">
        <audio ref={audioRef} onEnded={onSongEnd} loop={isRepeat} />
        {/* Song Info */}
        <div className="flex items-center gap-4 w-1/3">
          {currentSong ? (
            <>
              <div className="w-14 h-14 bg-gray-700 rounded">
                {currentSong.coverImage && <img src={currentSong.coverImage} alt={currentSong.title} className="w-full h-full object-cover rounded" />}
              </div>
              <div className="hidden sm:block">
                  <h4 className="text-sm font-semibold truncate">{currentSong.title}</h4>
                  {currentSong.movie && <p className="text-xs text-gray-400 truncate">{currentSong.movie}</p>}
                  <p className="text-xs text-gray-400">{currentSong.singer || currentSong.artist}</p>
              </div>
              <div className="flex items-center gap-3 ml-4">
                  <button onClick={toggleLike} className="text-gray-400 hover:text-red-500" title="Like">
                      {isLiked ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
                  </button>
                  <button onClick={() => setIsCommentModalOpen(true)} className="text-gray-400 hover:text-white" title="Comments">
                      <FaComment />
                  </button>
                  <button onClick={handleDownload} className="text-gray-400 hover:text-white" title="Download">
                      <FaDownload />
                  </button>
                  <div className="flex gap-2 border-l border-gray-700 pl-3">
                      <FaFacebook className="text-gray-400 hover:text-blue-600 cursor-pointer" onClick={() => handleShare('facebook')} title="Share on Facebook" />
                      <FaTwitter className="text-gray-400 hover:text-blue-400 cursor-pointer" onClick={() => handleShare('twitter')} title="Share on Twitter" />
                      <FaInstagram className="text-gray-400 hover:text-pink-500 cursor-pointer" onClick={() => handleShare('instagram')} title="Share on Instagram" />
                  </div>
              </div>
            </>
          ) : (
            <div className="w-14 h-14"></div> /* Placeholder to maintain layout */
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-2 w-1/3">
          <div className="flex items-center gap-6 text-gray-400">
            <FaRandom 
              size={16} 
              className={`cursor-pointer ${isShuffle ? 'text-green-500' : 'hover:text-white'}`} 
              onClick={toggleShuffle} 
            />
            <FaStepBackward className="hover:text-white cursor-pointer" size={20} onClick={onPrev} />
            {isPlaying ? (
              <FaPauseCircle onClick={togglePlayPause} className="text-white cursor-pointer hover:scale-105 transition" size={32} />
            ) : (
              <FaPlayCircle onClick={togglePlayPause} className="text-white cursor-pointer hover:scale-105 transition" size={32} />
            )}
            <FaStepForward className="hover:text-white cursor-pointer" size={20} onClick={onNext} />
            <FaRedo 
              size={16} 
              className={`cursor-pointer ${isRepeat ? 'text-green-500' : 'hover:text-white'}`} 
              onClick={toggleRepeat} 
            />
          </div>
          <div className="w-full flex items-center gap-2 text-xs text-gray-400">
              <span className="w-10 text-right">{formatTime(currentTime)}</span>
              <div ref={progressRef} onMouseDown={handleProgressMouseDown} className="w-full max-w-md bg-gray-600 rounded-full h-1 cursor-pointer group">
                  <div style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }} className="bg-white h-1 rounded-full group-hover:bg-green-500"></div>
              </div>
              <span className="w-10 text-left">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume */}
        <div className="flex items-center justify-end gap-4 w-1/3 text-gray-400">
          <button className="hover:text-white" title="Queue">
              <FaListUl size={16} />
          </button>
          <button className="hover:text-white" title="Devices">
              <FaLaptop size={18} />
          </button>
          <button onClick={toggleMute} className="hover:text-white">
              {isMuted || volume === 0 ? <FaVolumeOff size={20} /> : volume < 0.5 ? <FaVolumeDown size={20} /> : <FaVolumeUp size={20} />}
          </button>
          <div ref={volumeRef} onMouseDown={handleVolumeMouseDown} className="w-24 bg-gray-600 rounded-full h-1 cursor-pointer group">
            <div style={{ width: `${(isMuted ? 0 : volume) * 100}%` }} className="bg-white h-1 rounded-full group-hover:bg-green-500"></div>
          </div>
        </div>
      </div>
      {isCommentModalOpen && <CommentModal song={currentSong} user={user} onClose={() => setIsCommentModalOpen(false)} />}
    </>
  );
};

export default Player;
