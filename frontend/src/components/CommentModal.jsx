import React, { useState, useEffect } from 'react';
import { FaTimes, FaPaperPlane, FaTrash } from 'react-icons/fa';
import api from '../api';

const CommentModal = ({ song, user, onClose }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (song?._id) {
      fetchComments();
    }
  }, [song]);

  const fetchComments = async () => {
    try {
      const res = await api.get(`/api/comments/${song._id}`);
      setComments(res.data);
    } catch (err) {
      console.error("Failed to fetch comments", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const res = await api.post('/api/comments', {
        songId: song._id,
        text: newComment
      });
      // Add new comment to top of list
      setComments([res.data, ...comments]);
      setNewComment('');
    } catch (err) {
      console.error("Failed to post comment", err);
      alert("Failed to post comment");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await api.delete(`/api/comments/${commentId}`);
      setComments(comments.filter(c => c._id !== commentId));
    } catch (err) {
      console.error("Failed to delete comment", err);
    }
  };

  // Helper function to format image URLs correctly
  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const cleanPath = path.replace(/\\/g, '/');
    return `/${cleanPath.startsWith('/') ? cleanPath.slice(1) : cleanPath}`;
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-900 w-full max-w-md h-[80vh] rounded-lg flex flex-col shadow-2xl border border-gray-800" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-800/50 rounded-t-lg">
          <div>
            <h3 className="font-bold text-lg text-white">Comments</h3>
            <p className="text-xs text-gray-400">for {song.title}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <FaTimes size={20} />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-700">
          {comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <p>No comments yet.</p>
              <p className="text-sm">Be the first to share your thoughts!</p>
            </div>
          ) : (
            comments.map(comment => (
              <div key={comment._id} className="flex gap-3 animate-fade-in">
                <div className="w-8 h-8 rounded-full bg-gray-700 shrink-0 overflow-hidden border border-gray-600">
                  {comment.user && comment.user.profileImage ? (
                    <img src={getImageUrl(comment.user.profileImage)} alt="User" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white bg-purple-600">
                      {comment.user ? comment.user.username.charAt(0).toUpperCase() : '?'}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="bg-gray-800 p-3 rounded-2xl rounded-tl-none border border-gray-700">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-sm text-gray-200">
                        {comment.user ? comment.user.username : 'Unknown User'}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 wrap-break-word">{comment.text}</p>
                  </div>
                  {user && comment.user && user._id === comment.user._id && (
                    <button 
                      onClick={() => handleDelete(comment._id)} 
                      className="text-xs text-red-500 mt-1 hover:text-red-400 ml-2 flex items-center gap-1"
                    >
                      <FaTrash size={10} /> Delete
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input Area */}
        {user ? (
          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-800 bg-gray-800/30 flex gap-2 rounded-b-lg">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 bg-gray-700 text-white rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400"
            />
            <button 
              type="submit" 
              disabled={loading || !newComment.trim()}
              className="bg-green-500 text-black w-10 h-10 rounded-full flex items-center justify-center hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition transform active:scale-95"
            >
              <FaPaperPlane size={14} />
            </button>
          </form>
        ) : (
          <div className="p-4 border-t border-gray-800 text-center bg-gray-800/30 rounded-b-lg">
            <p className="text-sm text-gray-400">Please <span className="text-green-500 font-bold">login</span> to comment</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default CommentModal;