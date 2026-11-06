import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/register', { name, email, password, role: 'Guest' });
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Registration error');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-6 border rounded-xl bg-white shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Create Guest Account</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border rounded-lg p-2.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border rounded-lg p-2.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border rounded-lg p-2.5 text-sm"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg text-sm font-semibold transition"
        >
          Create Account
        </button>
      </form>
    </div>
  );
};