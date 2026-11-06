import React, { useEffect, useState } from 'react';
import api from '../api/client';
import type { RoomType } from '../types';

export const RoomManagementPage: React.FC = () => {
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [editingRoom, setEditingRoom] = useState<Partial<RoomType> | null>(null);
  const [facilitiesInput, setFacilitiesInput] = useState('');

  const fetchRooms = async () => {
    try {
      const res = await api.get('/rooms');
      setRooms(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleEditClick = (room: RoomType) => {
    setEditingRoom(room);
    setFacilitiesInput(room.facilities.join(', '));
  };

  const handleCreateClick = () => {
    setEditingRoom({
      name: '',
      description: '',
      capacity: 2,
      pricePerNight: 100,
      totalInventory: 5,
      isActive: true,
      imageUrl: '',
    });
    setFacilitiesInput('WiFi, Air Conditioning');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom) return;

    const payload = {
      ...editingRoom,
      facilities: facilitiesInput.split(',').map((f) => f.trim()).filter(Boolean),
    };

    try {
      if (editingRoom._id) {
        await api.put(`/rooms/${editingRoom._id}`, payload);
      } else {
        await api.post('/rooms', payload);
      }
      setEditingRoom(null);
      fetchRooms();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save room type');
    }
  };

  const toggleActiveStatus = async (room: RoomType) => {
    try {
      await api.put(`/rooms/${room._id}`, { isActive: !room.isActive });
      fetchRooms();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Room Types & Inventory Management</h1>
          <p className="text-sm text-gray-500">Configure room types, pricing, and available inventory counts</p>
        </div>
        <button
          onClick={handleCreateClick}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          + Add New Room Type
        </button>
      </div>

      {editingRoom && (
        <form onSubmit={handleSave} className="bg-white border rounded-xl p-6 mb-8 shadow-sm space-y-4">
          <h3 className="font-bold text-lg text-gray-800">
            {editingRoom._id ? 'Edit Room Type' : 'Create Room Type'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Room Name</label>
              <input
                type="text"
                value={editingRoom.name || ''}
                onChange={(e) => setEditingRoom({ ...editingRoom, name: e.target.value })}
                required
                className="w-full border rounded-lg p-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Image URL</label>
              <input
                type="text"
                value={editingRoom.imageUrl || ''}
                onChange={(e) => setEditingRoom({ ...editingRoom, imageUrl: e.target.value })}
                className="w-full border rounded-lg p-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={editingRoom.description || ''}
              onChange={(e) => setEditingRoom({ ...editingRoom, description: e.target.value })}
              required
              className="w-full border rounded-lg p-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Max Guests (Capacity)</label>
              <input
                type="number"
                min="1"
                value={editingRoom.capacity || 1}
                onChange={(e) => setEditingRoom({ ...editingRoom, capacity: Number(e.target.value) })}
                required
                className="w-full border rounded-lg p-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Price per Night ($)</label>
              <input
                type="number"
                min="0"
                value={editingRoom.pricePerNight || 0}
                onChange={(e) => setEditingRoom({ ...editingRoom, pricePerNight: Number(e.target.value) })}
                required
                className="w-full border rounded-lg p-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Total Inventory Count</label>
              <input
                type="number"
                min="1"
                value={editingRoom.totalInventory || 1}
                onChange={(e) => setEditingRoom({ ...editingRoom, totalInventory: Number(e.target.value) })}
                required
                className="w-full border rounded-lg p-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Facilities (comma-separated)</label>
            <input
              type="text"
              value={facilitiesInput}
              onChange={(e) => setFacilitiesInput(e.target.value)}
              className="w-full border rounded-lg p-2 text-sm"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setEditingRoom(null)}
              className="px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold"
            >
              Save Room
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b text-gray-600">
            <tr>
              <th className="p-3">Room Type</th>
              <th className="p-3">Capacity</th>
              <th className="p-3">Price/Night</th>
              <th className="p-3">Inventory</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rooms.map((room) => (
              <tr key={room._id} className="hover:bg-gray-50">
                <td className="p-3 font-semibold text-gray-900">{room.name}</td>
                <td className="p-3">{room.capacity} Guests</td>
                <td className="p-3 font-bold">${room.pricePerNight}</td>
                <td className="p-3 font-medium text-indigo-700">{room.totalInventory} Units</td>
                <td className="p-3">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                      room.isActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border-slate-300'
                    }`}
                  >
                    {room.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-3 text-right space-x-2">
                  <button
                    onClick={() => handleEditClick(room)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded text-gray-700 font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => toggleActiveStatus(room)}
                    className={`text-xs px-3 py-1.5 rounded font-medium ${
                      room.isActive
                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                    }`}
                  >
                    {room.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};