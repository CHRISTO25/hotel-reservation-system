import React, { useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const SearchPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guestCount, setGuestCount] = useState(1);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookingMessage, setBookingMessage] = useState<{ text: string; error: boolean } | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setBookingMessage(null);
    try {
      const res = await api.get(`/rooms/search?checkIn=${checkIn}&checkOut=${checkOut}&guestCount=${guestCount}`);
      setResults(res.data);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to search rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (roomTypeId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setBookingMessage(null);
    try {
      await api.post('/reservations', {
        roomTypeId,
        checkIn,
        checkOut,
        guestCount,
        roomCount: 1,
      });
      setBookingMessage({ text: 'Reservation confirmed successfully!', error: false });
      // Re-trigger search to update remaining inventory counts
      const res = await api.get(`/rooms/search?checkIn=${checkIn}&checkOut=${checkOut}&guestCount=${guestCount}`);
      setResults(res.data);
    } catch (err: any) {
      setBookingMessage({
        text: err.response?.data?.message || 'Booking conflict or room unavailable.',
        error: true,
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Search Room Availability</h2>
      <form onSubmit={handleSearch} className="bg-white p-6 rounded-xl shadow-sm border grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Check-in Date</label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            required
            className="w-full border rounded-lg p-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Check-out Date</label>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            required
            className="w-full border rounded-lg p-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Guests</label>
          <input
            type="number"
            min="1"
            max="10"
            value={guestCount}
            onChange={(e) => setGuestCount(Number(e.target.value))}
            className="w-full border rounded-lg p-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg text-sm transition"
        >
          {loading ? 'Checking...' : 'Find Rooms'}
        </button>
      </form>

      {bookingMessage && (
        <div className={`mt-6 p-4 rounded-lg font-medium text-sm ${bookingMessage.error ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
          {bookingMessage.text}
        </div>
      )}

      <div className="mt-8 space-y-4">
        {results.map(({ room, availableRooms, nights, totalAmount, isAvailable }) => (
          <div key={room._id} className="border bg-white rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center shadow-sm">
            <div>
              <h3 className="text-lg font-bold text-gray-900">{room.name}</h3>
              <p className="text-sm text-gray-600">{room.description}</p>
              <div className="mt-2 text-xs text-gray-500">
                <span>Capacity: Up to {room.capacity} guests</span> |{' '}
                <span className={availableRooms > 0 ? 'text-green-600 font-semibold' : 'text-red-500 font-semibold'}>
                  {availableRooms > 0 ? `${availableRooms} rooms left` : 'Fully Booked'}
                </span>
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex flex-col md:items-end">
              <span className="text-xl font-bold text-gray-900">${totalAmount}</span>
              <span className="text-xs text-gray-500">Total for {nights} night(s)</span>
              <button
                disabled={!isAvailable}
                onClick={() => handleBook(room._id)}
                className={`mt-2 px-4 py-2 rounded-lg text-sm font-medium ${isAvailable ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              >
                {isAvailable ? 'Confirm Booking' : 'Unavailable'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};