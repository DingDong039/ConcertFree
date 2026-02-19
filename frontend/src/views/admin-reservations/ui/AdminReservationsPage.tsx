// frontend/src/views/admin-reservations/ui/AdminReservationsPage.tsx
'use client';

import { useEffect, useState } from 'react';
import {
  Ticket,
  RefreshCw,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import {
  Skeleton,
  Badge,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Avatar,
  AvatarFallback,
} from '@/shared/ui';
import { reservationApi, type Reservation, ReservationStatusBadge } from '@/entities/reservation';
import { cn } from '@/shared/lib';

export function AdminReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setIsLoading(true);
        const data = await reservationApi.getAll();
        setReservations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load reservations');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReservations();
  }, []);

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    reservationApi
      .getAll()
      .then((data) => {
        setReservations(data);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load reservations');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const activeCount = reservations.filter((r) => r.status === 'active').length;
  const cancelledCount = reservations.filter((r) => r.status === 'cancelled').length;

  if (error) {
    return (
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <Card className="text-center py-12 border-destructive/50">
            <CardContent>
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Ticket className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Failed to Load Reservations</h2>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button onClick={handleRetry} variant="outline" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-heading font-bold">
                All Reservations
              </h1>
              <p className="text-muted-foreground">
                View and manage all ticket reservations
              </p>
            </div>
          </div>

          {!isLoading && reservations.length > 0 && (
            <div className="hidden sm:flex items-center gap-2">
              <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600 gap-1">
                <CheckCircle className="w-3 h-3" />
                {activeCount} Active
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <XCircle className="w-3 h-3" />
                {cancelledCount} Cancelled
              </Badge>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-1/4" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="h-4 w-1/2 mt-2" />
              </div>
            ))}
          </div>
        ) : reservations.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Ticket className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No Reservations Yet</h2>
              <p className="text-muted-foreground">
                Reservations will appear here once users start booking tickets
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Desktop Table View */}
            <Card className="hidden md:block overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Concert</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reserved At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reservations.map((reservation) => (
                    <TableRow key={reservation.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                              {reservation.user?.name?.charAt(0).toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {reservation.user?.name || 'N/A'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {reservation.user?.email || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">
                          {reservation.concert?.name || 'N/A'}
                        </p>
                      </TableCell>
                      <TableCell>
                        <ReservationStatusBadge status={reservation.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">
                            {new Date(reservation.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {reservations.map((reservation) => (
                <Card key={reservation.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {reservation.user?.name?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {reservation.user?.name || 'N/A'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {reservation.user?.email || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <ReservationStatusBadge status={reservation.status} />
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Ticket className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Concert:</span>
                        <span className="font-medium">
                          {reservation.concert?.name || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Reserved:</span>
                        <span>
                          {new Date(reservation.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Mobile Stats */}
            <div className="md:hidden flex items-center justify-center gap-2 mt-6">
              <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600 gap-1">
                <CheckCircle className="w-3 h-3" />
                {activeCount} Active
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <XCircle className="w-3 h-3" />
                {cancelledCount} Cancelled
              </Badge>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
