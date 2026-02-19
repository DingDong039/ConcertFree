// frontend/src/views/concerts/ui/ConcertsPage.tsx
'use client';

import { useEffect, useState } from 'react';
import { Music, RefreshCw, Search, Calendar } from 'lucide-react';
import { Skeleton, Card, CardContent, Button, Input, Badge } from '@/shared/ui';
import { ConcertCard } from '@/widgets/concert-card';
import { concertApi, type Concert } from '@/entities/concert';

export function ConcertsPage() {
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [filteredConcerts, setFilteredConcerts] = useState<Concert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchConcerts = async () => {
      try {
        setIsLoading(true);
        const data = await concertApi.getAll();
        setConcerts(data);
        setFilteredConcerts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load concerts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchConcerts();
  }, []);

  // Filter concerts based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredConcerts(concerts);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = concerts.filter(
      (concert) =>
        concert.name.toLowerCase().includes(query) ||
        concert.description.toLowerCase().includes(query)
    );
    setFilteredConcerts(filtered);
  }, [searchQuery, concerts]);

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    concertApi
      .getAll()
      .then((data) => {
        setConcerts(data);
        setFilteredConcerts(data);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load concerts');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // Calculate stats
  const availableCount = concerts.filter((c) => c.availableSeats > 0).length;
  const soldOutCount = concerts.filter((c) => c.availableSeats === 0).length;

  if (error) {
    return (
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <Card className="text-center py-12 border-destructive/50">
            <CardContent>
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Music className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Failed to Load Concerts</h2>
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
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-heading font-bold">
                Upcoming Concerts
              </h1>
              <p className="text-muted-foreground">
                Discover and book tickets for amazing live events
              </p>
            </div>
          </div>
        </div>

        {/* Filters and Stats */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search concerts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Stats */}
          <div className="flex items-center gap-2">
            <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">
              {availableCount} Available
            </Badge>
            <Badge variant="secondary">
              {soldOutCount} Sold Out
            </Badge>
          </div>
        </div>

        {/* Concerts Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-6" />
                <Skeleton className="h-2 w-full mb-4" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        ) : filteredConcerts.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Music className="w-8 h-8 text-muted-foreground" />
              </div>
              {searchQuery ? (
                <>
                  <h2 className="text-xl font-semibold mb-2">No Results Found</h2>
                  <p className="text-muted-foreground mb-4">
                    No concerts match your search &quot;{searchQuery}&quot;
                  </p>
                  <Button variant="outline" onClick={() => setSearchQuery('')}>
                    Clear Search
                  </Button>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-semibold mb-2">No Concerts Available</h2>
                  <p className="text-muted-foreground">
                    Check back later for upcoming events!
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredConcerts.map((concert) => (
              <ConcertCard key={concert.id} concert={concert} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
