import React, { useEffect, useState } from 'react';
import api from '../api/client';
import type{ RoomType } from '../types';
import { Link } from 'react-router-dom';

export const HomePage: React.FC = () => {
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/rooms')
      .then((res) => setRooms(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-500">Loading hotel rooms...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900">Experience Comfort & Elegance</h1>
        <p className="mt-2 text-gray-600">Browse our available room types and book your reservation directly.</p>
        <Link
          to="/search"
          className="mt-4 inline-block bg-indigo-600 text-white font-medium px-5 py-2.5 rounded-lg shadow hover:bg-indigo-700 transition"
        >
          Check Date Availability
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <div key={room._id} className="border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition bg-white flex flex-col justify-between">
            <img
              src={room.imageUrl || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600'}
              alt={room.name}
              className="h-48 w-full object-cover"
            />
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-800">{room.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{room.description}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {room.facilities.map((f, i) => (
                    <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between border-t pt-4">
                <div>
                  <span className="text-2xl font-bold text-gray-900">${room.pricePerNight}</span>
                  <span className="text-xs text-gray-500"> / night</span>
                </div>
                <Link
                  to={`/search?roomTypeId=${room._id}`}
                  className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3.5 py-2 rounded-md font-medium text-sm transition"
                >
                  Book Now
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};