// frontend/src/features/reserve-concert/model/use-reserve.ts
"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { reservationApi } from "@/entities/reservation";
import { mutate } from "swr";
import { useReservationStore, type Reservation } from "@/entities/reservation";
import type { PaginatedResponse } from "@/shared/api";

export function useReserve() {
  const [isReserving, setIsReserving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const addReservation = useReservationStore((state) => state.addReservation);

  const reserve = useCallback(
    async (concertId: string) => {
      if (isReserving) return;
      setIsReserving(true);
      setError(null);

      try {
        const reservation = await reservationApi.reserve(concertId);
        addReservation(reservation);

        // Optimistically update the SWR cache for /reservations/me
        mutate(
          (key: string) => typeof key === 'string' && key.startsWith('/reservations/me'),
          (currentData: PaginatedResponse<Reservation> | undefined) => {
            if (!currentData) return currentData;
            return {
              ...currentData,
              data: [reservation, ...(currentData.data || [])],
              total: (currentData.total || 0) + 1,
            };
          },
          false // Don't revalidate immediately to prevent flashing
        );

        // Invalidate other related SWR caches
        mutate((key: string) => typeof key === 'string' && key.startsWith('/concerts'));
        mutate((key: string) => typeof key === 'string' && key.startsWith('/admin/reservations'));

        toast.success("Reservation successful!", {
          description: `Time: ${new Date().toLocaleString()}`,
        });
        return reservation;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to reserve";
        setError(message);
        toast.error("Reservation failed", {
          description: message,
        });
        throw err;
      } finally {
        setIsReserving(false);
      }
    },
    [addReservation, isReserving],
  );

  return {
    reserve,
    isReserving,
    error,
    clearError: () => setError(null),
  };
}
