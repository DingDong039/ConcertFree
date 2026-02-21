// frontend/src/features/reserve-concert/model/use-reserve.ts
"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { reservationApi } from "@/entities/reservation";
import { mutate } from "swr";
import { useReservationStore } from "@/entities/reservation";

export function useReserve() {
  const [isReserving, setIsReserving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const addReservation = useReservationStore((state) => state.addReservation);

  const reserve = useCallback(
    async (concertId: string) => {
      setIsReserving(true);
      setError(null);

      try {
        const reservation = await reservationApi.reserve(concertId);
        addReservation(reservation);

        // Invalidate related SWR caches
        mutate("/concerts");
        mutate("/reservations/me");
        mutate("/admin/reservations");

        toast.success("Reservation successful!", {
          description:
            "Your ticket has been booked. Check your email for confirmation.",
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
    [addReservation],
  );

  return {
    reserve,
    isReserving,
    error,
    clearError: () => setError(null),
  };
}
