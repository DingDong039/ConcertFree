// frontend/src/views/concerts/ui/ConcertsPage.tsx
"use client";

import { useState, useEffect } from "react";
import { Music, RefreshCw, Search, Calendar } from "lucide-react";
import { Skeleton, Card, CardContent, Button, Input, Badge } from "@/shared/ui";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/shared/ui/pagination";
import { ConcertCard } from "@/widgets/concert-card";
import { type Concert } from "@/entities/concert";
import useSWR from "swr";
import { fetcher, PaginatedResponse } from "@/shared/api";

export function ConcertsPage() {
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 9;

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
    mutate: fetchConcerts,
  } = useSWR<PaginatedResponse<Concert>>(
    `/concerts?page=${page}&limit=${limit}${
      debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : ""
    }`,
    fetcher
  );

  const concerts = response?.data || [];
  const total = response?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const currentError = swrError
    ? swrError instanceof Error
      ? swrError.message
      : "Failed to load concerts"
    : error;

  const handleRetry = () => {
    setError(null);
    fetchConcerts();
  };

  // Fetch all concerts to calculate accurate stats across all pages
  const { data: allConcerts = [] } = useSWR<Concert[]>("/concerts", fetcher);
  
  const safeAllConcerts = Array.isArray(allConcerts) ? allConcerts : [];
  const filteredAllConcerts = debouncedSearch.trim()
    ? safeAllConcerts.filter((concert) => {
        const query = debouncedSearch.toLowerCase();
        return (
          concert.name.toLowerCase().includes(query) ||
          concert.description.toLowerCase().includes(query)
        );
      })
    : safeAllConcerts;

  const availableCount = filteredAllConcerts.filter((c) => c.availableSeats > 0).length;
  const soldOutCount = filteredAllConcerts.filter((c) => c.availableSeats === 0).length;

  if (currentError && !isLoading) {
    return (
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <Card className="text-center py-12 border-destructive/50">
            <CardContent>
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Music className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold mb-2">
                Failed to Load Concerts
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
          <div className="absolute bottom-0 left-0 p-32 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-linear-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center shadow-inner border border-primary/10">
                <Calendar className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-heading font-extrabold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400">
                  Upcoming Concerts
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1 text-lg">
                  Discover and book tickets for amazing live events
                </p>
              </div>
            </div>

            {/* Filters and Stats */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative w-full sm:w-64 md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search concerts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-primary rounded-xl"
                />
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <Badge
                  variant="default"
                  className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 rounded-lg px-3 py-1.5 font-semibold transition-colors"
                >
                  {availableCount} Available
                </Badge>
                <Badge 
                  variant="secondary"
                  className="rounded-lg px-3 py-1.5 font-semibold"
                >
                  {soldOutCount} Sold Out
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Concerts Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-6 animate-pulse"
              >
                <Skeleton className="h-6 w-3/4 mb-4 rounded-lg" />
                <Skeleton className="h-4 w-full mb-2 rounded-md" />
                <Skeleton className="h-4 w-2/3 mb-6 rounded-md" />
                <Skeleton className="h-2 w-full mb-4 rounded-md" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            ))}
          </div>
        ) : concerts.length === 0 ? (
          <Card className="text-center py-20 border-dashed border-2 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 rounded-3xl">
            <CardContent className="flex flex-col items-center justify-center">
              <div className="w-24 h-24 mb-6 relative">
                <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping opacity-75" />
                <div className="relative bg-white dark:bg-slate-800 w-full h-full rounded-full flex items-center justify-center border shadow-sm">
                  <Music className="w-10 h-10 text-primary/60" />
                </div>
              </div>
              {searchQuery ? (
                <>
                  <h2 className="text-2xl font-bold font-heading mb-3">
                    No Results Found
                  </h2>
                  <p className="text-muted-foreground mb-8 max-w-sm text-lg">
                    No concerts match your search &quot;{searchQuery}&quot;. Please try a different term.
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
                    No Concerts Available
                  </h2>
                  <p className="text-muted-foreground text-lg max-w-sm">
                    Check back later for upcoming events! We are constantly adding new shows.
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {concerts.map((concert) => (
                <ConcertCard key={concert.id} concert={concert} />
              ))}
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
          </div>
        )}
      </div>
    </div>
  );
}
