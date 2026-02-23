// frontend/src/views/reservations-me/ui/ReservationsMePage.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Ticket, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import {
  Skeleton,
  Card,
  CardContent,
  Button,
  Badge,
  Separator,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/shared/ui";
import {
  ReservationCard,
  reservationApi,
  type Reservation,
} from "@/entities/reservation";
import { ROUTES } from "@/shared/config";
import useSWR from "swr";
import { fetcher, PaginatedResponse } from "@/shared/api";
import { toast } from "sonner";

export function ReservationsMePage() {
  const [page, setPage] = useState(1);
  const limit = 10;

  const {
    data: response,
    isLoading,
    error: swrError,
    mutate,
  } = useSWR<PaginatedResponse<Reservation>>(`/reservations/me?page=${page}&limit=${limit}`, fetcher);
  
  const reservations = response?.data || [];
  const total = response?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const currentError = swrError
    ? swrError instanceof Error
      ? swrError.message
      : "Failed to load reservations"
    : error;

  const handleCancel = async (id: string) => {
    try {
      setCancellingId(id);
      await reservationApi.cancel(id);
      mutate();
      toast.success("Reservation cancelled", {
        description: `Time: ${new Date().toLocaleString()}`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to cancel reservation";
      setError(message);
      toast.error("Cancellation failed", {
        description: message,
      });
    } finally {
      setCancellingId(null);
    }
  };

  const handleRetry = () => {
    setError(null);
    mutate();
  };

  const activeReservations = reservations.filter((r) => r.status === "active");
  const cancelledReservations = reservations.filter(
    (r) => r.status === "cancelled",
  );

  if (currentError && !isLoading) {
    return (
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <Card className="text-center py-12 border-destructive/50">
            <CardContent>
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Ticket className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold mb-2">
                Failed to Load Reservations
              </h2>
              <p className="text-muted-foreground mb-6">{currentError}</p>
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
    <div className="pt-24 pb-12 px-4 min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Premium Page Header */}
        <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-8 md:p-10">
          <div className="absolute top-0 right-0 p-32 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 p-32 bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-linear-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center shadow-inner border border-primary/10">
                <Ticket className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-heading font-extrabold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400">
                  My Tickets
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1 text-lg">
                  Manage your concert reservations
                </p>
              </div>
            </div>

            {!isLoading && reservations.length > 0 && (
              <div className="hidden sm:flex items-center gap-2">
                <Badge
                  variant="default"
                  className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 rounded-lg px-3 py-1.5 font-semibold transition-colors gap-1.5"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  {activeReservations.length} Active
                </Badge>
                <Badge 
                  variant="secondary"
                  className="rounded-lg px-3 py-1.5 font-semibold gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors border-0"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  {cancelledReservations.length} Cancelled
                </Badge>
              </div>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-6 animate-pulse"
              >
                <Skeleton className="h-6 w-3/4 mb-4 rounded-lg" />
                <Skeleton className="h-4 w-full mb-2 rounded-md" />
                <Skeleton className="h-4 w-2/3 mb-6 rounded-md" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            ))}
          </div>
        ) : reservations.length === 0 ? (
          <Card className="text-center py-20 border-dashed border-2 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 rounded-3xl">
            <CardContent className="flex flex-col items-center justify-center">
              <div className="w-24 h-24 mb-6 relative">
                <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping opacity-75" />
                <div className="relative bg-white dark:bg-slate-800 w-full h-full rounded-full flex items-center justify-center border shadow-sm">
                  <Ticket className="w-10 h-10 text-primary/60" />
                </div>
              </div>
              <h2 className="text-2xl font-bold font-heading mb-3">
                No Reservations Yet
              </h2>
              <p className="text-muted-foreground mb-8 text-lg max-w-sm">
                Start by booking tickets for your favorite concerts
              </p>
              <Link href={ROUTES.CONCERTS}>
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md gap-2 rounded-xl">
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
                  <h2 className="text-xl font-semibold">Active Tickets</h2>
                  <Badge
                    variant="default"
                    className="bg-emerald-500 hover:bg-emerald-600"
                  >
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
            {activeReservations.length > 0 &&
              cancelledReservations.length > 0 && (
                <Separator className="my-8" />
              )}

            {/* Cancelled Reservations */}
            {cancelledReservations.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-xl font-semibold text-muted-foreground">
                    Cancelled Tickets
                  </h2>
                  <Badge variant="secondary">
                    {cancelledReservations.length}
                  </Badge>
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

            {totalPages > 1 && (
              <Pagination className="mt-8">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      aria-disabled={page === 1}
                      className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  <div className="text-sm font-medium mx-4 text-slate-500 dark:text-slate-400">
                    Page {page} of {totalPages}
                  </div>
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      aria-disabled={page === totalPages}
                      className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
