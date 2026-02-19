// frontend/src/entities/reservation/model/types.ts
import type { User } from '@/entities/user';
import type { Concert } from '@/entities/concert';

export interface Reservation {
  id: string;
  userId: string;
  concertId: string;
  status: 'active' | 'cancelled';
  user?: User;
  concert?: Concert;
  createdAt: string;
  updatedAt: string;
}

export type ReservationStatus = Reservation['status'];

export const isActive = (reservation: Reservation): boolean => {
  return reservation.status === 'active';
};

export const isCancelled = (reservation: Reservation): boolean => {
  return reservation.status === 'cancelled';
};
