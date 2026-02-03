import React, { useState, useEffect } from 'react';
import { FaTimes, FaPaperPlane, FaTrash } from 'react-icons/fa';
import api from '../api';

const CommentModal = ({ song, user, onClose }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const cleanPath = path.replace(/\\/g, '/');
    return `${backendUrl}/${cleanPath.startsWith('/') ? cleanPath.slice(1) : cleanPath}`;
  };

  useEffect(() => {
    if (song) {
      const fetchComments = async () => {
        setIsLoading(true);
        try {
          const response = await api.get(`/songs/${song._id}/comments`);
          setComments(response.data);
        } catch (error) {
          console.error("Failed to fetch comments", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchComments();
    }
  }, [song]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await api.post(`/songs/${song._id}/comments`, { text: newComment }, {
        headers: { 'x-auth-token': token }
      });
      setComments([response.data, ...comments]);
      setNewComment('');
    } catch (error) {
      console.error("Failed to post comment", error);
      alert(error.response?.data?.message || error.message || "Could not post comment. Please make sure you are logged in.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;

    try {
      const token = localStorage.getItem('token');
      await api.delete(`/songs/comments/${commentId}`, {
        headers: { 'x-auth-token': token }
      });
      setComments(comments.filter(c => c._id !== commentId));
    } catch (error) {
      console.error("Failed to delete comment", error);
      alert(error.response?.data?.message || "Failed to delete comment");
    }
  };

  if (!song) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-900 text-white rounded-lg w-11/12 md:w-1/2 lg:w-1/3 max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <header className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold">Comments for {song.title}</h2>
          <FaTimes className="cursor-pointer" onClick={onClose} />
        </header>
        
        <div className="p-4 flex-1 overflow-y-auto">
          {isLoading ? (
            <p>Loading comments...</p>
          ) : comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment._id} className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center font-bold shrink-0">
                    {comment.user && comment.user.profileImage ? (
                      <img src={getImageUrl(comment.user.profileImage)} alt={comment.user.username} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      comment.user ? comment.user.username.charAt(0).toUpperCase() : '?'
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm">{comment.user ? comment.user.username : 'Unknown User'}</p>
                    <p className="text-gray-300">{comment.text}</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(comment.createdAt).toLocaleString()}</p>
                  </div>
                  {user && comment.user && user._id === comment.user._id && (
                    <button onClick={() => handleDeleteComment(comment._id)} className="text-gray-500 hover:text-red-500 transition p-1" title="Delete comment">
                      <FaTrash size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No comments yet. Be the first to comment!</p>
          )}
        </div>

        <footer className="p-4 border-t border-gray-700">
          {user ? (
            <form onSubmit={handleCommentSubmit} className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 p-2 bg-gray-800 rounded border border-gray-700 focus:outline-none focus:border-green-500"
              />
              <button type="submit" className="bg-green-500 text-black font-bold px-4 rounded hover:bg-green-400 transition">
                <FaPaperPlane />
              </button>
            </form>
          ) : (
            <p className="text-center text-gray-400">Please log in to comment.</p>
          )}
        </footer>
      </div>
    </div>
  );
};

export default CommentModal;