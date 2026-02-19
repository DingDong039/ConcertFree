// frontend/src/entities/reservation/ui/ReservationStatus.tsx
'use client';

import { CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/shared/ui';
import type { ReservationStatus } from '../model';
import { cn } from '@/shared/lib';

interface ReservationStatusProps {
  status: ReservationStatus;
}

export function ReservationStatusBadge({ status }: ReservationStatusProps) {
  const isActive = status === 'active';

  return (
    <Badge
      variant={isActive ? 'default' : 'secondary'}
      className={cn(
        'gap-1',
        isActive && 'bg-emerald-500 hover:bg-emerald-600'
      )}
    >
      {isActive ? (
        <CheckCircle className="w-3 h-3" />
      ) : (
        <XCircle className="w-3 h-3" />
      )}
      {isActive ? 'Active' : 'Cancelled'}
    </Badge>
  );
}
