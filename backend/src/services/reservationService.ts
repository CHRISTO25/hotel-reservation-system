import mongoose, { Types } from 'mongoose';
import { Reservation, IReservation } from '../models/Reservation';
import { RoomType } from '../models/RoomType';
import { ReservationStatus } from '../types';

export class ReservationService {
  public static calculatePricing(checkIn: Date, checkOut: Date, pricePerNight: number) {
    const diffTime = checkOut.getTime() - checkIn.getTime();
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (nights <= 0) {
      throw new Error('Check-out date must be after check-in date.');
    }
    const totalAmount = nights * pricePerNight;
    return { nights, totalAmount };
  }

  public static async getAvailableInventory(
    roomTypeId: string,
    checkIn: Date,
    checkOut: Date,
    session?: mongoose.ClientSession
  ): Promise<{ availableRooms: number; totalInventory: number; pricePerNight: number; capacity: number }> {
    const roomType = await RoomType.findOne({ _id: roomTypeId, isActive: true }).session(session || null);
    if (!roomType) {
      throw new Error('Selected room type does not exist or is inactive.');
    }

    // Include PENDING, CONFIRMED, and CHECKED_IN to protect against overbooking
    const query = {
      roomTypeId: new Types.ObjectId(roomTypeId),
      status: { $in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED, ReservationStatus.CHECKED_IN] },
      checkIn: { $lt: checkOut },
      checkOut: { $gt: checkIn },
    };

    const overlappingBookings = await Reservation.find(query).session(session || null);
    const bookedRooms = overlappingBookings.reduce((sum, res) => sum + res.roomCount, 0);
    const availableRooms = roomType.totalInventory - bookedRooms;

    return {
      availableRooms: Math.max(0, availableRooms),
      totalInventory: roomType.totalInventory,
      pricePerNight: roomType.pricePerNight,
      capacity: roomType.capacity,
    };
  }

  public static async createReservation(data: {
    guestId: string;
    roomTypeId: string;
    checkIn: string;
    checkOut: string;
    guestCount: number;
    roomCount?: number;
    initialStatus?: ReservationStatus;
  }): Promise<IReservation> {
    const checkInDate = new Date(data.checkIn);
    const checkOutDate = new Date(data.checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkInDate < today) {
      throw new Error('Check-in date cannot be in the past.');
    }
    if (checkOutDate <= checkInDate) {
      throw new Error('Check-out date must be strictly after check-in date.');
    }

    const roomCountToBook = data.roomCount || 1;

    // Concurrency handling: MongoDB Transaction ensures atomicity
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { availableRooms, pricePerNight, capacity } = await this.getAvailableInventory(
        data.roomTypeId,
        checkInDate,
        checkOutDate,
        session
      );

      const maxCapacity = capacity * roomCountToBook;
      if (data.guestCount > maxCapacity) {
        throw new Error(`Guest count exceeds room capacity of ${maxCapacity}.`);
      }

      if (availableRooms < roomCountToBook) {
        const error: any = new Error('No rooms available for the selected dates.');
        error.statusCode = 409;
        throw error;
      }

      const { totalAmount } = this.calculatePricing(checkInDate, checkOutDate, pricePerNight);
      const referenceNo = `RES-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      const reservation = new Reservation({
        referenceNo,
        guestId: data.guestId,
        roomTypeId: data.roomTypeId,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guestCount: data.guestCount,
        roomCount: roomCountToBook,
        priceSnapshot: pricePerNight,
        totalAmount,
        status: data.initialStatus || ReservationStatus.CONFIRMED,
      });

      await reservation.save({ session });
      await session.commitTransaction();
      return reservation;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}