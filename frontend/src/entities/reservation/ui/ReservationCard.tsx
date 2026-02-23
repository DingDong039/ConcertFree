// frontend/src/entities/reservation/ui/ReservationCard.tsx
'use client';

import { Calendar, XCircle } from 'lucide-react';
import type { Reservation } from '../model';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Button,
} from '@/shared/ui';
import { ReservationStatusBadge } from './ReservationStatus';
import { isActive } from '../model';
import { cn } from '@/shared/lib';

interface ReservationCardProps {
  reservation: Reservation;
  onCancel?: (id: string) => void;
  isCancelling?: boolean;
  showCancelButton?: boolean;
}

export function ReservationCard({
  reservation,
  onCancel,
  isCancelling,
  showCancelButton = true,
}: ReservationCardProps) {
  const active = isActive(reservation);
  const concertName = reservation.concert?.name || 'Unknown Concert';
  const reservedAt = new Date(reservation.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Card
      className={cn(
        'concert-card overflow-hidden h-full flex flex-col',
        !active && 'opacity-60'
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg font-heading line-clamp-2">
            {concertName}
          </CardTitle>
          <ReservationStatusBadge status={active ? 'active' : 'cancelled'} />
        </div>
        {reservation.concert?.description && (
          <CardDescription className="line-clamp-2">
            {reservation.concert.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="flex-1">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>Reserved on {reservedAt}</span>
        </div>
      </CardContent>

      {showCancelButton && active && (
        <CardFooter className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button
            variant="destructive"
            className="w-full"
            disabled={isCancelling}
            onClick={() => onCancel?.(reservation.id)}
          >
            <XCircle className="w-4 h-4 mr-2" />
            {isCancelling ? 'Cancelling...' : 'Cancel Reservation'}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
