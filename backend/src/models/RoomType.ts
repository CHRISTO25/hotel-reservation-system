import { Schema, model, Document } from 'mongoose';

export interface IRoomType extends Document {
  name: string;
  description: string;
  capacity: number;
  facilities: string[];
  pricePerNight: number;
  totalInventory: number;
  isActive: boolean;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const roomTypeSchema = new Schema<IRoomType>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    capacity: { type: Number, required: true, min: 1 },
    facilities: [{ type: String }],
    pricePerNight: { type: Number, required: true, min: 0 },
    totalInventory: { type: Number, required: true, min: 1 },
    isActive: { type: Boolean, default: true, index: true },
    imageUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

export const RoomType = model<IRoomType>('RoomType', roomTypeSchema);