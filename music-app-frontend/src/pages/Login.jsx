import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import Logo from '../components/Logo';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Login attempting with:", formData);
      const response = await api.post('/auth/login', formData);
      console.log("Login success:", response.data);
      localStorage.setItem('token', response.data.token);
      navigate('/');
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || 'Login failed. Check console for details.');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-black text-white">
      <div className="bg-spotify-gray p-8 rounded-lg w-96">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="p-3 bg-gray-800 rounded border border-gray-700 focus:outline-none focus:border-green-500" required />
          <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} className="p-3 bg-gray-800 rounded border border-gray-700 focus:outline-none focus:border-green-500" required />
          <button type="submit" className="bg-green-500 text-black font-bold py-3 rounded hover:bg-green-400 transition">
            Log In
          </button>
        </form>
        <p className="mt-4 text-center text-gray-400 text-sm">
          Don't have an account? <Link to="/register" className="text-white hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;