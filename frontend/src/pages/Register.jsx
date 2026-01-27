import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import Logo from '../components/Logo';
import { useAuth } from './AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/auth/register', formData);
      
      // Auto login after registration
      const loginRes = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password
      });
      
      await login(loginRes.data.token);
      navigate('/');
    } catch (err) {
      console.error("Registration Error:", err);
      setError(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center h-screen bg-black text-white">
      <div className="bg-spotify-gray p-8 rounded-lg w-96">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} className="p-3 bg-gray-800 rounded border border-gray-700 focus:outline-none focus:border-green-500" required />
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="p-3 bg-gray-800 rounded border border-gray-700 focus:outline-none focus:border-green-500" required />
          <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} className="p-3 bg-gray-800 rounded border border-gray-700 focus:outline-none focus:border-green-500" required />
          <button type="submit" disabled={loading} className={`bg-green-500 text-black font-bold py-3 rounded hover:bg-green-400 transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        <p className="mt-4 text-center text-gray-400 text-sm">
          Already have an account? <Link to="/login" className="text-white hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;