import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { RoomType } from '../models/RoomType';
import { Reservation } from '../models/Reservation';
import { UserRole, ReservationStatus } from '../types';

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || '');
    console.log('Clearing database for seeding...');

    await User.deleteMany({});
    await RoomType.deleteMany({});
    await Reservation.deleteMany({});

    const passwordHash = await bcrypt.hash('password123', 10);

    await User.create({
      name: 'Admin Manager',
      email: 'staff@hotel.com',
      passwordHash,
      role: UserRole.STAFF,
    });

    const guest = await User.create({
      name: 'John Guest',
      email: 'guest@hotel.com',
      passwordHash,
      role: UserRole.GUEST,
    });

    const deluxe = await RoomType.create({
      name: 'Deluxe Ocean View',
      description: 'Spacious king-bed room with panoramic ocean view.',
      capacity: 2,
      facilities: ['WiFi', 'Air Conditioning', 'King Bed', 'Mini Bar'],
      pricePerNight: 150,
      totalInventory: 3,
      isActive: true,
      imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
    });

    await RoomType.create({
      name: 'Standard Twin Room',
      description: 'Comfortable twin bedroom ideal for friends or colleagues.',
      capacity: 2,
      facilities: ['WiFi', 'Air Conditioning', 'Twin Beds'],
      pricePerNight: 90,
      totalInventory: 5,
      isActive: true,
      imageUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
    });

    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() + 1);
    const checkOut = new Date();
    checkOut.setDate(checkOut.getDate() + 3);

    await Reservation.create({
      referenceNo: 'RES-DEMO-001',
      guestId: guest._id,
      roomTypeId: deluxe._id,
      checkIn,
      checkOut,
      guestCount: 2,
      roomCount: 1,
      priceSnapshot: 150,
      totalAmount: 300,
      status: ReservationStatus.CONFIRMED,
    });

    console.log('Seeding completed.');
    console.log('Staff: staff@hotel.com / password123');
    console.log('Guest: guest@hotel.com / password123');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seed();