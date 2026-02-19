// frontend/src/entities/concert/ui/ConcertListItem.tsx
'use client';

import { Ticket, Users } from 'lucide-react';
import type { Concert } from '../model';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Progress,
} from '@/shared/ui';
import { isSoldOut, getAvailabilityPercentage } from '../model';
import { cn } from '@/shared/lib';

interface ConcertListItemProps {
  concert: Concert;
  onReserve?: (concertId: string) => void;
  isReserving?: boolean;
  showReserveButton?: boolean;
}

export function ConcertListItem({
  concert,
  onReserve,
  isReserving,
  showReserveButton = true,
}: ConcertListItemProps) {
  const soldOut = isSoldOut(concert);
  const availabilityPercent = getAvailabilityPercentage(concert);

  return (
    <Card
      className={cn(
        'concert-card overflow-hidden h-full flex flex-col',
        soldOut && 'opacity-75'
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg font-heading line-clamp-2">
            {concert.name}
          </CardTitle>
          <Badge
            variant={soldOut ? 'destructive' : 'default'}
            className={cn(
              'shrink-0',
              !soldOut && 'bg-emerald-500 hover:bg-emerald-600'
            )}
          >
            {soldOut ? 'Sold Out' : `${concert.availableSeats} left`}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2">
          {concert.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        {/* Availability progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="w-4 h-4" />
              Availability
            </span>
            <span className="font-medium">{availabilityPercent}%</span>
          </div>
          <Progress
            value={availabilityPercent}
            className={cn(
              'h-2',
              availabilityPercent > 50 && '[&>div]:bg-emerald-500',
              availabilityPercent <= 50 && availabilityPercent > 20 && '[&>div]:bg-amber-500',
              availabilityPercent <= 20 && '[&>div]:bg-red-500'
            )}
          />
          <p className="text-xs text-muted-foreground">
            {concert.availableSeats} of {concert.totalSeats} seats available
          </p>
        </div>
      </CardContent>

      {showReserveButton && (
        <CardFooter className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button
            className="w-full bg-cta hover:bg-cta-hover text-white"
            disabled={soldOut || isReserving}
            onClick={(e) => {
              e.stopPropagation();
              onReserve?.(concert.id);
            }}
          >
            <Ticket className="w-4 h-4 mr-2" />
            {isReserving ? 'Reserving...' : soldOut ? 'Sold Out' : 'Reserve Ticket'}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
