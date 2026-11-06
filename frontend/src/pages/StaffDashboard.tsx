import React, { useEffect, useState } from 'react';
import api from '../api/client';
import type { Reservation } from '../types';

export const StaffDashboard: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const loadData = async () => {
    try {
      const [sumRes, listRes] = await Promise.all([
        api.get('/reservations/staff/summary'),
        api.get(`/reservations/staff/all?page=${page}&limit=5${statusFilter ? `&status=${statusFilter}` : ''}`),
      ]);
      setSummary(sumRes.data);
      setReservations(listRes.data.data);
      setTotalPages(listRes.data.meta.totalPages);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, statusFilter]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/reservations/staff/${id}/status`, { status: newStatus });
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Status transition failed.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Front Desk & Hotel Operations</h1>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border rounded-xl p-4 shadow-sm">
            <span className="text-xs text-gray-500 uppercase font-semibold">Today's Arrivals</span>
            <div className="text-2xl font-bold text-indigo-600 mt-1">{summary.todayArrivals}</div>
          </div>
          <div className="bg-white border rounded-xl p-4 shadow-sm">
            <span className="text-xs text-gray-500 uppercase font-semibold">Today's Departures</span>
            <div className="text-2xl font-bold text-amber-600 mt-1">{summary.todayDepartures}</div>
          </div>
          <div className="bg-white border rounded-xl p-4 shadow-sm">
            <span className="text-xs text-gray-500 uppercase font-semibold">Occupied Rooms</span>
            <div className="text-2xl font-bold text-emerald-600 mt-1">{summary.occupiedRooms}</div>
          </div>
          <div className="bg-white border rounded-xl p-4 shadow-sm">
            <span className="text-xs text-gray-500 uppercase font-semibold">Pending Bookings</span>
            <div className="text-2xl font-bold text-gray-600 mt-1">{summary.pendingConfirmations}</div>
          </div>
        </div>
      )}

      <div className="bg-white border rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h3 className="font-bold text-lg text-gray-800">All Guest Reservations (Server Paginated)</h3>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="border rounded-lg text-sm px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Checked-in">Checked-in</option>
            <option value="Checked-out">Checked-out</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b text-gray-600">
              <tr>
                <th className="p-3">Ref</th>
                <th className="p-3">Guest</th>
                <th className="p-3">Room</th>
                <th className="p-3">Dates</th>
                <th className="p-3">Total</th>
                <th className="p-3">Status</th>
                <th className="p-3">Front Desk Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {reservations.map((r) => (
                <tr key={r._id} className="hover:bg-gray-50 transition">
                  <td className="p-3 font-mono font-medium text-xs text-indigo-700">{r.referenceNo}</td>
                  <td className="p-3 font-medium text-gray-900">{r.guestId?.name}</td>
                  <td className="p-3 text-gray-700">{r.roomTypeId?.name}</td>
                  <td className="p-3 text-xs text-gray-600">
                    {new Date(r.checkIn).toLocaleDateString()} &rarr; {new Date(r.checkOut).toLocaleDateString()}
                  </td>
                  <td className="p-3 font-bold text-gray-900">${r.totalAmount}</td>
                  <td className="p-3">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                        r.status === 'Confirmed'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : r.status === 'Checked-in'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : r.status === 'Checked-out'
                          ? 'bg-slate-100 text-slate-700 border-slate-300'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="p-3 space-x-2">
                    {r.status === 'Confirmed' && (
                      <button
                        onClick={() => handleStatusChange(r._id, 'Checked-in')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 rounded shadow-sm font-medium transition"
                      >
                        Check-in
                      </button>
                    )}
                    {r.status === 'Checked-in' && (
                      <button
                        onClick={() => handleStatusChange(r._id, 'Checked-out')}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded shadow-sm font-medium transition"
                      >
                        Check-out
                      </button>
                    )}
                    {r.status === 'Checked-out' && (
                      <span className="text-xs text-slate-400 font-medium italic">
                        Completed
                      </span>
                    )}
                    {r.status === 'Cancelled' && (
                      <span className="text-xs text-red-400 font-medium italic">
                        Cancelled
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Server Pagination Controls */}
        <div className="flex items-center justify-between border-t mt-4 pt-4">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="text-xs border px-3 py-1.5 rounded font-medium disabled:opacity-40 hover:bg-gray-50 transition"
          >
            Previous
          </button>
          <span className="text-xs text-gray-600 font-medium">
            Page {page} of {totalPages || 1}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="text-xs border px-3 py-1.5 rounded font-medium disabled:opacity-40 hover:bg-gray-50 transition"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};