import { Request, Response } from 'express';
import { Reservation } from '../models/Reservation';
import { ReservationService } from '../services/reservationService';
import { ReservationStatus, UserRole } from '../types';

export const createReservation = async (req: Request, res: Response): Promise<void> => {
  try {
    const reservation = await ReservationService.createReservation({
      guestId: req.user!.userId,
      roomTypeId: req.body.roomTypeId,
      checkIn: req.body.checkIn,
      checkOut: req.body.checkOut,
      guestCount: Number(req.body.guestCount),
      roomCount: Number(req.body.roomCount) || 1,
    });
    res.status(201).json(reservation);
  } catch (error: any) {
    const statusCode = error.statusCode || 400;
    res.status(statusCode).json({ message: error.message });
  }
};

export const getMyReservations = async (req: Request, res: Response): Promise<void> => {
  try {
    const reservations = await Reservation.find({ guestId: req.user!.userId })
      .populate('roomTypeId')
      .sort({ createdAt: -1 });
    res.status(200).json(reservations);
  } catch (error: any) {
    res.status(500).json({ message: 'Error retrieving reservations.' });
  }
};

export const cancelReservation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const reservation = await Reservation.findById(id);

    if (!reservation) {
      res.status(404).json({ message: 'Reservation not found.' });
      return;
    }

    if (req.user!.role === UserRole.GUEST && reservation.guestId.toString() !== req.user!.userId) {
      res.status(403).json({ message: 'Unauthorized to cancel this reservation.' });
      return;
    }

    if (reservation.status !== ReservationStatus.CONFIRMED && reservation.status !== ReservationStatus.PENDING) {
      res.status(400).json({ message: `Cannot cancel reservation with status ${reservation.status}.` });
      return;
    }

    reservation.status = ReservationStatus.CANCELLED;
    await reservation.save();
    res.status(200).json({ message: 'Reservation cancelled successfully.', reservation });
  } catch (error: any) {
    res.status(500).json({ message: 'Error cancelling reservation.' });
  }
};

// Staff-Only: Server-side paginated queries
export const getAllReservationsPaginated = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
    const skip = (page - 1) * limit;

    const query: any = {};
    if (req.query.status) {
      query.status = req.query.status;
    }

    const [reservations, totalCount] = await Promise.all([
      Reservation.find(query)
        .populate('guestId', 'name email')
        .populate('roomTypeId', 'name pricePerNight')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Reservation.countDocuments(query),
    ]);

    res.status(200).json({
      data: reservations,
      meta: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error querying reservations.' });
  }
};

// Staff-Only: Status transition
export const updateReservationStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const reservation = await Reservation.findById(id);
    if (!reservation) {
      res.status(404).json({ message: 'Reservation not found.' });
      return;
    }

    const validTransitions: Record<string, string[]> = {
      [ReservationStatus.CONFIRMED]: [ReservationStatus.CHECKED_IN, ReservationStatus.CANCELLED],
      [ReservationStatus.CHECKED_IN]: [ReservationStatus.CHECKED_OUT],
      [ReservationStatus.CHECKED_OUT]: [],
      [ReservationStatus.CANCELLED]: [],
    };

    if (!validTransitions[reservation.status]?.includes(status)) {
      res.status(400).json({
        message: `Invalid state transition from ${reservation.status} to ${status}.`,
      });
      return;
    }

    reservation.status = status;
    await reservation.save();
    res.status(200).json(reservation);
  } catch (error: any) {
    res.status(500).json({ message: 'Status update failed.' });
  }
};

// Staff-Only: Front Desk Summary
export const getDashboardSummary = async (_req: Request, res: Response): Promise<void> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [todayArrivals, todayDepartures, occupiedRooms, pendingConfirmations] = await Promise.all([
      Reservation.countDocuments({
        checkIn: { $gte: today, $lt: tomorrow },
        status: ReservationStatus.CONFIRMED,
      }),
      Reservation.countDocuments({
        checkOut: { $gte: today, $lt: tomorrow },
        status: ReservationStatus.CHECKED_IN,
      }),
      Reservation.countDocuments({
        status: ReservationStatus.CHECKED_IN,
      }),
      Reservation.countDocuments({
        status: ReservationStatus.PENDING,
      }),
    ]);

    res.status(200).json({
      todayArrivals,
      todayDepartures,
      occupiedRooms,
      pendingConfirmations,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error retrieving summary metrics.' });
  }
};