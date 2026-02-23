// frontend/src/views/admin-reservations/ui/AdminReservationsPage.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Ticket,
  RefreshCw,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  Search,
} from "lucide-react";
import {
  Skeleton,
  Badge,
  Card,
  CardContent,
  Button,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Avatar,
  AvatarFallback,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/shared/ui";
import {
  type Reservation,
  ReservationStatusBadge,
} from "@/entities/reservation";
import useSWR from "swr";
import { fetcher, PaginatedResponse } from "@/shared/api";

export function AdminReservationsPage() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const limit = 10;

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const {
    data: response,
    isLoading,
    error: swrError,
    mutate: fetchReservations,
  } = useSWR<PaginatedResponse<Reservation>>(
    `/reservations?page=${page}&limit=${limit}${
      debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : ""
    }`,
    fetcher
  );
  
  const reservations = response?.data || [];
  const total = response?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const [error, setError] = useState<string | null>(null);

  const currentError = swrError
    ? swrError instanceof Error
      ? swrError.message
      : "Failed to load reservations"
    : error;

  const handleRetry = () => {
    setError(null);
    fetchReservations();
  };

  // Fetch ALL reservations (unpaginated, unsearched) to compute accurate global header statistics
  const { data: allReservations = [] } = useSWR<Reservation[]>("/reservations", fetcher);
  const safeAllReservations = Array.isArray(allReservations) ? allReservations : [];
  
  const activeCount = safeAllReservations.filter((r) => r.status === "active").length;
  const cancelledCount = safeAllReservations.filter(
    (r) => r.status === "cancelled",
  ).length;

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
          <div className="absolute bottom-0 left-0 p-32 bg-rose-500/5 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-start lg:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-linear-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center shadow-inner border border-primary/10">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-heading font-extrabold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400">
                  All Reservations
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1 text-lg">
                  View and manage all ticket reservations
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row shadow-sm sm:shadow-none items-center gap-4 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-primary rounded-xl"
                />
              </div>

              {!isLoading && safeAllReservations.length > 0 && (
                <div className="hidden lg:flex items-center gap-2">
                  <Badge
                    variant="default"
                    className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 rounded-lg px-3 py-1.5 font-semibold transition-colors gap-1.5"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    {activeCount} Active
                  </Badge>
                  <Badge 
                    variant="secondary" 
                    className="rounded-lg px-3 py-1.5 font-semibold gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors border-0"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    {cancelledCount} Cancelled
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-4 animate-pulse"
              >
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-1/4 rounded-lg" />
                  <Skeleton className="h-6 w-20 rounded-lg" />
                </div>
                <Skeleton className="h-4 w-1/2 mt-2 rounded-md" />
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
              {searchQuery ? (
                <>
                  <h2 className="text-2xl font-bold font-heading mb-3">
                    No Users Found
                  </h2>
                  <p className="text-muted-foreground mb-8 text-lg max-w-sm">
                    No reservations matching &quot;{searchQuery}&quot; were found.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setSearchQuery("")}
                    className="rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Clear Search
                  </Button>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold font-heading mb-3">
                    No Reservations Yet
                  </h2>
                  <p className="text-muted-foreground mb-8 text-lg max-w-sm">
                    Reservations will appear here once users start booking tickets
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Desktop Table View */}
            <Card className="hidden md:block overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-semibold py-5 px-6 w-[30%]">User</TableHead>
                      <TableHead className="font-semibold py-5 w-[35%]">Concert</TableHead>
                      <TableHead className="font-semibold py-5 w-[15%]">Status</TableHead>
                      <TableHead className="font-semibold py-5 px-6 shrink-0">Reserved At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                  {reservations.map((reservation) => (
                    <TableRow key={reservation.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                              {reservation.user?.name
                                ?.charAt(0)
                                .toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {reservation.user?.name || "N/A"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {reservation.user?.email || "N/A"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">
                          {reservation.concert?.name || "N/A"}
                        </p>
                      </TableCell>
                      <TableCell>
                        <ReservationStatusBadge status={reservation.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">
                            {new Date(reservation.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            </Card>

            {/* Mobile Card View */}
            <div className="md:hidden grid gap-4">
              {reservations.map((reservation) => (
                <Card key={reservation.id} className="rounded-2xl overflow-hidden shadow-sm border-slate-200 dark:border-slate-800">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {reservation.user?.name?.charAt(0).toUpperCase() ||
                              "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {reservation.user?.name || "N/A"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {reservation.user?.email || "N/A"}
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
                          {reservation.concert?.name || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Reserved:</span>
                        <span>
                          {new Date(reservation.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Mobile Stats */}
            <div className="md:hidden flex items-center justify-center gap-2 mt-6">
              <Badge
                variant="default"
                className="bg-emerald-500 hover:bg-emerald-600 gap-1"
              >
                <CheckCircle className="w-3 h-3" />
                {activeCount} Active
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <XCircle className="w-3 h-3" />
                {cancelledCount} Cancelled
              </Badge>
            </div>

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
          </>
        )}
      </div>
    </div>
  );
}
