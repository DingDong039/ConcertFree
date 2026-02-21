// frontend/src/widgets/concert-card/ui/ConcertCard.tsx
"use client";

import { useState } from "react";
import { Ticket, Users, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Progress,
  Alert,
} from "@/shared/ui";
import type { Concert } from "@/entities/concert";
import { useReserve } from "@/features/reserve-concert";
import { useIsAuthenticated } from "@/features/auth";
import { ROUTES } from "@/shared/config";
import { cn } from "@/shared/lib";

interface ConcertCardProps {
  concert: Concert;
}

export function ConcertCard({ concert }: ConcertCardProps) {
  const isAuthenticated = useIsAuthenticated();
  const { reserve, isReserving, error } = useReserve();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const availablePercentage =
    (concert.availableSeats / concert.totalSeats) * 100;
  const isSoldOut = concert.availableSeats === 0;

  const handleReserve = async () => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }

    try {
      await reserve(concert.id);
    } catch {
      // Error is handled by useReserve hook
    }
  };

  return (
    <div className="relative h-full">
      <Card className="concert-card overflow-hidden border-slate-200 dark:border-slate-700 h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:border-primary/20 hover:-translate-y-1 group">
        <CardHeader className="pb-3 relative overflow-hidden">
          {/* Subtle background glow effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="flex items-start justify-between gap-2 relative z-10">
            <CardTitle className="text-lg font-heading line-clamp-2">
              {concert.name}
            </CardTitle>
            <Badge
              variant={isSoldOut ? "destructive" : "default"}
              className={cn(
                "shrink-0",
                !isSoldOut && "bg-emerald-500 hover:bg-emerald-600",
              )}
            >
              {isSoldOut ? "Sold Out" : "Available"}
            </Badge>
          </div>
          <CardDescription className="line-clamp-2">
            {concert.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-1 space-y-4">
          {/* Seat Availability */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="w-4 h-4" />
                Seats
              </span>
              <span className="font-medium">
                {concert.availableSeats} / {concert.totalSeats}
              </span>
            </div>
            <Progress value={availablePercentage} className="h-2" />
          </div>
        </CardContent>

        <CardFooter className="pt-3 border-t border-slate-100 dark:border-slate-800">
          {isSoldOut ? (
            <Button disabled className="w-full" variant="secondary">
              <Ticket className="w-4 h-4 mr-2" />
              Sold Out
            </Button>
          ) : (
            <Button
              onClick={handleReserve}
              disabled={isReserving}
              className="w-full bg-cta hover:bg-cta-hover text-white"
            >
              <Ticket className="w-4 h-4 mr-2" />
              {isReserving ? "Reserving..." : "Reserve Ticket"}
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Login Prompt Overlay */}
      {showLoginPrompt && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-xl flex items-center justify-center z-10 p-4">
          <Alert className="max-w-sm bg-white dark:bg-slate-900 border-0 shadow-xl">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-primary" />
                <span className="font-semibold">Sign in required</span>
              </div>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setShowLoginPrompt(false)}
                className="shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Please sign in to reserve tickets for this concert.
            </p>
            <div className="flex gap-2">
              <a href={ROUTES.LOGIN} className="flex-1">
                <Button className="w-full">Sign In</Button>
              </a>
              <Button
                variant="outline"
                onClick={() => setShowLoginPrompt(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </Alert>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="destructive" className="mt-2">
          <p className="text-sm">{error}</p>
        </Alert>
      )}
    </div>
  );
}
