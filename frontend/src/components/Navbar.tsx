import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-slate-900 text-white shadow">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold tracking-tight text-indigo-400">
          Grand Horizon Hotel
        </Link>
        <nav className="flex items-center space-x-6">
          <Link to="/" className="hover:text-indigo-300">Rooms</Link>
          <Link to="/search" className="hover:text-indigo-300">Availability</Link>
          {user?.role === 'Guest' && (
            <Link to="/my-reservations" className="hover:text-indigo-300">My Bookings</Link>
          )}
          {user?.role === 'Staff' && (
            <Link to="/staff/dashboard" className="text-amber-400 font-semibold hover:text-amber-300">
              Staff Portal
            </Link>
          )}
          {user ? (
            <div className="flex items-center space-x-3">
              <span className="text-xs bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700">
                {user.name} ({user.role})
              </span>
              <button
                onClick={handleLogout}
                className="text-sm bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex space-x-3">
              <Link to="/login" className="text-sm bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded">
                Login
              </Link>
              <Link to="/register" className="text-sm border border-indigo-400 px-3 py-1.5 rounded hover:bg-slate-800">
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};