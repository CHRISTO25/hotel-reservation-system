import { Request, Response } from 'express';
import { RoomType } from '../models/RoomType';
import { ReservationService } from '../services/reservationService';

export const getRooms = async (req: Request, res: Response): Promise<void> => {
  try {
    const rooms = await RoomType.find({ isActive: true });
    res.status(200).json(rooms);
  } catch (error: any) {
    res.status(500).json({ message: 'Error retrieving rooms.' });
  }
};

export const searchAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const { checkIn, checkOut, guestCount } = req.query;
    if (!checkIn || !checkOut) {
      res.status(400).json({ message: 'Check-in and check-out dates are required.' });
      return;
    }

    const checkInDate = new Date(String(checkIn));
    const checkOutDate = new Date(String(checkOut));
    const guests = Number(guestCount) || 1;

    const activeRooms = await RoomType.find({ isActive: true, capacity: { $gte: guests } });

    const results = await Promise.all(
      activeRooms.map(async (room) => {
        const { availableRooms } = await ReservationService.getAvailableInventory(
          room._id.toString(),
          checkInDate,
          checkOutDate
        );
        const { nights, totalAmount } = ReservationService.calculatePricing(
          checkInDate,
          checkOutDate,
          room.pricePerNight
        );
        return {
          room,
          availableRooms,
          nights,
          totalAmount,
          isAvailable: availableRooms > 0,
        };
      })
    );

    res.status(200).json(results);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const createRoomType = async (req: Request, res: Response): Promise<void> => {
  try {
    const newRoom = await RoomType.create(req.body);
    res.status(201).json(newRoom);
  } catch (error: any) {
    res.status(400).json({ message: 'Failed to create room type.', error: error.message });
  }
};

export const updateRoomType = async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await RoomType.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      res.status(404).json({ message: 'Room type not found.' });
      return;
    }
    res.status(200).json(updated);
  } catch (error: any) {
    res.status(400).json({ message: 'Failed to update room type.' });
  }
};