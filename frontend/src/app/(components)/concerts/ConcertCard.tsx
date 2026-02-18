// frontend/src/app/(components)/concerts/ConcertCard.tsx
'use client';

import type { Concert } from '@/types';

interface ConcertCardProps {
  concert: Concert;
  onReserve?: (id: string) => void;
  isReserving?: boolean;
  isLoggedIn?: boolean;
}

export default function ConcertCard({
  concert,
  onReserve,
  isReserving,
  isLoggedIn,
}: ConcertCardProps) {
  const isSoldOut = concert.availableSeats <= 0;
  const pct = Math.round(
    ((concert.totalSeats - concert.availableSeats) / concert.totalSeats) * 100,
  );

  return (
    <div className="card concert-card flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-bold text-gray-900 leading-snug line-clamp-2">
          {concert.name}
        </h3>
        {isSoldOut ? (
          <span className="badge-soldout shrink-0">Sold Out</span>
        ) : (
          <span className="badge-available shrink-0">
            ● {concert.availableSeats} left
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-gray-500 line-clamp-3">
        {concert.description}
      </p>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Reserved</span>
          <span>{pct}%</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isSoldOut ? 'bg-red-400' : 'bg-violet-500'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Seat info */}
      <div className="flex items-center gap-4 text-xs text-gray-400">
        <span>🎫 Total: {concert.totalSeats}</span>
        <span>✅ Available: {concert.availableSeats}</span>
      </div>

      {/* Action button */}
      {onReserve && (
        <button
          onClick={() => onReserve(concert.id)}
          disabled={isSoldOut || isReserving || !isLoggedIn}
          className={`w-full mt-auto font-semibold py-2.5 rounded-xl text-sm transition ${
            isSoldOut
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'btn-primary'
          }`}
        >
          {!isLoggedIn
            ? 'Login to Reserve'
            : isReserving
              ? 'Reserving...'
              : isSoldOut
                ? 'Sold Out'
                : '🎟️ Reserve Seat'}
        </button>
      )}
    </div>
  );
}
