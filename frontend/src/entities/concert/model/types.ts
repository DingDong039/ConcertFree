// frontend/src/entities/concert/model/types.ts
export interface Concert {
  id: string;
  name: string;
  description: string;
  totalSeats: number;
  availableSeats: number;
  createdAt: string;
  updatedAt: string;
}

export type CreateConcertPayload = Omit<
  Concert,
  "id" | "createdAt" | "updatedAt" | "availableSeats"
>;

export type UpdateConcertPayload = Partial<CreateConcertPayload>;

export const isSoldOut = (concert: Concert): boolean => {
  return concert.availableSeats === 0;
};

export const getAvailabilityPercentage = (concert: Concert): number => {
  return Math.round((concert.availableSeats / concert.totalSeats) * 100);
};
