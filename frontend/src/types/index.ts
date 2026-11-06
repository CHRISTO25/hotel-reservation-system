export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Guest' | 'Staff';
}

export interface RoomType {
  _id: string;
  name: string;
  description: string;
  capacity: number;
  facilities: string[];
  pricePerNight: number;
  totalInventory: number;
  isActive: boolean;
  imageUrl?: string;
}

export interface Reservation {
  _id: string;
  referenceNo: string;
  guestId: { _id: string; name: string; email: string };
  roomTypeId: RoomType;
  checkIn: string;
  checkOut: string;
  guestCount: number;
  roomCount: number;
  priceSnapshot: number;
  totalAmount: number;
  status: 'Pending' | 'Confirmed' | 'Checked-in' | 'Checked-out' | 'Cancelled';
  createdAt: string;
}