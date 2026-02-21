// frontend/src/entities/concert/model/utils.ts
import type { Concert } from './types';

export const formatSeatInfo = (concert: Concert): string => {
  return `${concert.availableSeats} / ${concert.totalSeats} seats available`;
};

export const getAvailabilityStatus = (
  concert: Concert,
): 'available' | 'limited' | 'sold-out' => {
  const percentage = (concert.availableSeats / concert.totalSeats) * 100;
  if (percentage === 0) return 'sold-out';
  if (percentage < 20) return 'limited';
  return 'available';
};
