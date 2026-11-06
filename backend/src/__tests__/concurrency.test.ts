import request from 'supertest';
import mongoose from 'mongoose';
import app from '../index';
import { RoomType } from '../models/RoomType';
import { User } from '../models/User';
import { Reservation } from '../models/Reservation';
import { UserRole } from '../types';
import jwt from 'jsonwebtoken';

describe('Concurrency & Overbooking Prevention', () => {
  let guestTokenA: string;
  let guestTokenB: string;
  let testRoomId: string;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI || '');

    const room = await RoomType.create({
      name: 'Single Slot Suite',
      description: 'Unit with 1 room inventory',
      capacity: 2,
      facilities: ['WiFi'],
      pricePerNight: 100,
      totalInventory: 1,
      isActive: true,
    });
    testRoomId = room._id.toString();

    const userA = await User.create({
      name: 'Guest A',
      email: 'a@test.com',
      passwordHash: 'hash',
      role: UserRole.GUEST,
    });

    const userB = await User.create({
      name: 'Guest B',
      email: 'b@test.com',
      passwordHash: 'hash',
      role: UserRole.GUEST,
    });

    guestTokenA = jwt.sign(
      { userId: userA._id.toString(), email: userA.email, role: userA.role },
      process.env.JWT_SECRET || 'default_secret'
    );

    guestTokenB = jwt.sign(
      { userId: userB._id.toString(), email: userB.email, role: userB.role },
      process.env.JWT_SECRET || 'default_secret'
    );
  });

  afterAll(async () => {
    await Reservation.deleteMany({ roomTypeId: testRoomId });
    await RoomType.findByIdAndDelete(testRoomId);
    await User.deleteMany({ email: { $in: ['a@test.com', 'b@test.com'] } });
    await mongoose.connection.close();
  });

  it('rejects competing booking attempts when inventory is 1, preventing negative inventory', async () => {
    const bookingPayload = {
      roomTypeId: testRoomId,
      checkIn: new Date(Date.now() + 86400000).toISOString(),
      checkOut: new Date(Date.now() + 172800000).toISOString(),
      guestCount: 2,
      roomCount: 1,
    };

    const [resA, resB] = await Promise.all([
      request(app).post('/api/reservations').set('Authorization', `Bearer ${guestTokenA}`).send(bookingPayload),
      request(app).post('/api/reservations').set('Authorization', `Bearer ${guestTokenB}`).send(bookingPayload),
    ]);

    const statuses = [resA.status, resB.status];
    expect(statuses).toContain(201);
    expect(statuses).toContain(409);

    const count = await Reservation.countDocuments({ roomTypeId: testRoomId });
    expect(count).toBe(1);
  });
});