export enum UserRole {
  GUEST = 'Guest',
  STAFF = 'Staff',
}

export enum ReservationStatus {
  PENDING = 'Pending',
  CONFIRMED = 'Confirmed',
  CHECKED_IN = 'Checked-in',
  CHECKED_OUT = 'Checked-out',
  CANCELLED = 'Cancelled',
}

export interface IPaginationMeta {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}