import { Schema, model, Document, Types } from 'mongoose';
import { ReservationStatus } from '../types';

export interface IReservation extends Document {
  referenceNo: string;
  guestId: Types.ObjectId;
  roomTypeId: Types.ObjectId;
  checkIn: Date;
  checkOut: Date;
  guestCount: number;
  roomCount: number;
  priceSnapshot: number;
  totalAmount: number;
  status: ReservationStatus;
  createdAt: Date;
  updatedAt: Date;
}

const reservationSchema = new Schema<IReservation>(
  {
    referenceNo: { type: String, required: true, unique: true, index: true },
    guestId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    roomTypeId: { type: Schema.Types.ObjectId, ref: 'RoomType', required: true, index: true },
    checkIn: { type: Date, required: true, index: true },
    checkOut: { type: Date, required: true, index: true },
    guestCount: { type: Number, required: true, min: 1 },
    roomCount: { type: Number, default: 1, min: 1 },
    priceSnapshot: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: Object.values(ReservationStatus),
      default: ReservationStatus.CONFIRMED,
      index: true,
    },
  },
  { timestamps: true }
);

// High-performance compound index for availability queries
reservationSchema.index({ roomTypeId: 1, status: 1, checkIn: 1, checkOut: 1 });

export const Reservation = model<IReservation>('Reservation', reservationSchema);