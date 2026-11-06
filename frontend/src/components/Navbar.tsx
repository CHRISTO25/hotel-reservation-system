import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/login');
  };

  const closeMenu = () => setIsOpen(false);

  return (
    <header className="bg-slate-900 text-white shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link
          to="/"
          onClick={closeMenu}
          className="text-xl font-bold tracking-tight text-indigo-400 hover:text-indigo-300 transition"
        >
          Grand Horizon Hotel
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="hover:text-indigo-300 transition text-sm font-medium">
            Rooms
          </Link>
          <Link to="/search" className="hover:text-indigo-300 transition text-sm font-medium">
            Availability
          </Link>

          {user?.role === 'Guest' && (
            <Link to="/my-reservations" className="hover:text-indigo-300 transition text-sm font-medium">
              My Bookings
            </Link>
          )}

          {user?.role === 'Staff' && (
            <>
              <Link to="/staff/dashboard" className="text-amber-400 hover:text-amber-300 font-semibold transition text-sm">
                Staff Portal
              </Link>
              <Link to="/staff/rooms" className="text-amber-400 hover:text-amber-300 font-semibold transition text-sm">
                Manage Rooms
              </Link>
            </>
          )}

          {user ? (
            <div className="flex items-center space-x-3 pl-2 border-l border-slate-700">
              <span className="text-xs bg-slate-800 text-slate-200 px-2.5 py-1 rounded-full border border-slate-700 font-medium">
                {user.name} ({user.role})
              </span>
              <button
                onClick={handleLogout}
                className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md font-medium transition shadow-sm"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3 pl-2 border-l border-slate-700">
              <Link
                to="/login"
                className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-md font-medium transition shadow-sm"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm border border-indigo-400 hover:bg-slate-800 text-indigo-300 px-3.5 py-1.5 rounded-md font-medium transition"
              >
                Register
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            type="button"
            className="p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-expanded={isOpen}
            aria-label="Toggle navigation menu"
          >
            {isOpen ? (
              // Close Icon
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              // Hamburger Icon
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Drawer */}
      {isOpen && (
        <div className="md:hidden bg-slate-900 border-t border-slate-800 px-4 pt-3 pb-5 space-y-3 shadow-lg">
          <Link
            to="/"
            onClick={closeMenu}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-200 hover:bg-slate-800 hover:text-white"
          >
            Rooms
          </Link>
          <Link
            to="/search"
            onClick={closeMenu}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-200 hover:bg-slate-800 hover:text-white"
          >
            Availability
          </Link>

          {user?.role === 'Guest' && (
            <Link
              to="/my-reservations"
              onClick={closeMenu}
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-200 hover:bg-slate-800 hover:text-white"
            >
              My Bookings
            </Link>
          )}

          {user?.role === 'Staff' && (
            <>
              <Link
                to="/staff/dashboard"
                onClick={closeMenu}
                className="block px-3 py-2 rounded-md text-base font-medium text-amber-400 hover:bg-slate-800"
              >
                Staff Portal
              </Link>
              <Link
                to="/staff/rooms"
                onClick={closeMenu}
                className="block px-3 py-2 rounded-md text-base font-medium text-amber-400 hover:bg-slate-800"
              >
                Manage Rooms
              </Link>
            </>
          )}

          <div className="pt-4 border-t border-slate-800">
            {user ? (
              <div className="space-y-3">
                <div className="px-3 py-1 text-sm font-medium text-slate-300">
                  Signed in as: <span className="text-white font-semibold">{user.name}</span> ({user.role})
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium text-sm transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="text-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium text-sm transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={closeMenu}
                  className="text-center border border-indigo-400 hover:bg-slate-800 text-indigo-300 px-4 py-2 rounded-md font-medium text-sm transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};