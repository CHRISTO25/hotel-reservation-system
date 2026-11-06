import React, { useEffect, useState } from 'react';
import api from '../api/client';
import type{ Reservation } from '../types';

export const MyReservationsPage: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReservations = () => {
    api.get('/reservations/my-reservations')
      .then((res) => setReservations(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleCancel = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) return;
    try {
      await api.patch(`/reservations/${id}/cancel`);
      fetchReservations();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Cancellation failed');
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-500">Loading your reservations...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">My Reservations</h2>
      {reservations.length === 0 ? (
        <p className="text-gray-500">No reservations placed yet.</p>
      ) : (
        <div className="space-y-4">
          {reservations.map((res) => (
            <div key={res._id} className="border rounded-xl p-5 bg-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <div className="flex items-center space-x-3">
                  <span className="font-mono font-bold text-indigo-600 text-sm">{res.referenceNo}</span>
                  <span className="px-2 py-0.5 rounded text-xs font-semibold uppercase bg-gray-100 text-gray-700">
                    {res.status}
                  </span>
                </div>
                <h4 className="font-bold text-gray-800 mt-1">{res.roomTypeId?.name}</h4>
                <p className="text-xs text-gray-500 mt-1">
                  Dates: {new Date(res.checkIn).toLocaleDateString()} to {new Date(res.checkOut).toLocaleDateString()} | Guests: {res.guestCount}
                </p>
              </div>
              <div className="mt-4 md:mt-0 flex items-center space-x-4">
                <span className="font-bold text-gray-900">${res.totalAmount}</span>
                {res.status === 'Confirmed' && (
                  <button
                    onClick={() => handleCancel(res._id)}
                    className="text-xs border border-red-300 text-red-600 hover:bg-red-50 px-3 py-1.5 rounded transition"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};