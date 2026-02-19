// frontend/src/views/reservations-me/ui/ReservationsMePage.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Ticket, RefreshCw, Music, CheckCircle, XCircle } from 'lucide-react';
import {
  Skeleton,
  Card,
  CardContent,
  Button,
  Badge,
  Separator,
} from '@/shared/ui';
import { ReservationCard, reservationApi, type Reservation } from '@/entities/reservation';
import { ROUTES } from '@/shared/config';

export function ReservationsMePage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setIsLoading(true);
        const data = await reservationApi.getMine();
        setReservations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load reservations');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReservations();
  }, []);

  const handleCancel = async (id: string) => {
    try {
      setCancellingId(id);
      await reservationApi.cancel(id);
      setReservations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'cancelled' as const } : r))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel reservation');
    } finally {
      setCancellingId(null);
    }
  };

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    reservationApi
      .getMine()
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

  const activeReservations = reservations.filter((r) => r.status === 'active');
  const cancelledReservations = reservations.filter((r) => r.status === 'cancelled');

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
              <Ticket className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-heading font-bold">
                My Tickets
              </h1>
              <p className="text-muted-foreground">
                Manage your concert reservations
              </p>
            </div>
          </div>

          {!isLoading && reservations.length > 0 && (
            <div className="hidden sm:flex items-center gap-2">
              <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600 gap-1">
                <CheckCircle className="w-3 h-3" />
                {activeReservations.length} Active
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <XCircle className="w-3 h-3" />
                {cancelledReservations.length} Cancelled
              </Badge>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-6" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        ) : reservations.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Music className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No Reservations Yet</h2>
              <p className="text-muted-foreground mb-6">
                Start by booking tickets for your favorite concerts
              </p>
              <Link href={ROUTES.CONCERTS}>
                <Button className="bg-cta hover:bg-cta-hover text-white">
                  Browse Concerts
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Active Reservations */}
            {activeReservations.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <h2 className="text-xl font-semibold">Active Tickets</h2>
                  <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">
                    {activeReservations.length}
                  </Badge>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeReservations.map((reservation) => (
                    <ReservationCard
                      key={reservation.id}
                      reservation={reservation}
                      onCancel={handleCancel}
                      isCancelling={cancellingId === reservation.id}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Separator */}
            {activeReservations.length > 0 && cancelledReservations.length > 0 && (
              <Separator className="my-8" />
            )}

            {/* Cancelled Reservations */}
            {cancelledReservations.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <XCircle className="w-5 h-5 text-muted-foreground" />
                  <h2 className="text-xl font-semibold text-muted-foreground">
                    Cancelled Tickets
                  </h2>
                  <Badge variant="secondary">{cancelledReservations.length}</Badge>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cancelledReservations.map((reservation) => (
                    <ReservationCard
                      key={reservation.id}
                      reservation={reservation}
                      showCancelButton={false}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
