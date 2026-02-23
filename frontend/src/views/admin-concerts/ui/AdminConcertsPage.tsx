// frontend/src/views/admin-concerts/ui/AdminConcertsPage.tsx
"use client";

import { useState } from "react";
import {
  Plus,
  RefreshCw,
  Music,
  Edit,
  Trash2,
  Calendar,
  MoreHorizontal,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Progress,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/shared/ui";
import { Ticket } from "lucide-react";
import { ConcertForm } from "@/widgets/concert-form";
import {
  concertApi,
  type Concert,
  type CreateConcertPayload,
} from "@/entities/concert";
import { cn } from "@/shared/lib";
import useSWR from "swr";
import { fetcher, PaginatedResponse } from "@/shared/api";

export function AdminConcertsPage() {
  const [page, setPage] = useState(1);
  const limit = 10;

  const {
    data: response,
    isLoading,
    error: swrError,
    mutate,
  } = useSWR<PaginatedResponse<Concert>>(`/concerts?page=${page}&limit=${limit}`, fetcher);
  
  const concerts = response?.data || [];
  const total = response?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingConcert, setEditingConcert] = useState<Concert | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Use swrError if it exists, otherwise use local error
  const currentError = swrError
    ? swrError instanceof Error
      ? swrError.message
      : "Failed to load concerts"
    : error;

  const handleCreate = async (data: CreateConcertPayload) => {
    try {
      await concertApi.create(data);
      mutate();
      setShowForm(false);
    } catch (err) {
      throw err;
    }
  };

  const handleUpdate = async (data: CreateConcertPayload) => {
    if (!editingConcert) return;
    try {
      await concertApi.update(editingConcert.id, data);
      mutate();
      setEditingConcert(null);
      setShowForm(false);
    } catch (err) {
      throw err;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setSubmittingId(id);
      await concertApi.delete(id);
      mutate();
      setDeleteConfirmId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete concert");
    } finally {
      setSubmittingId(null);
    }
  };

  const handleEdit = (concert: Concert) => {
    setEditingConcert(concert);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingConcert(null);
  };

  const handleRetry = () => {
    setError(null);
    mutate();
  };

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
          <div className="absolute bottom-0 left-0 p-32 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-linear-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center shadow-inner border border-primary/10">
                <Music className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-heading font-extrabold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400">
                  Manage Concerts
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1 text-lg">
                  Curate and organize your upcoming musical events
                </p>
              </div>
            </div>

            {!showForm && (
              <Button
                onClick={() => setShowForm(true)}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 gap-2 rounded-xl transition-all duration-300 hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                <span className="font-semibold">Create Concert</span>
              </Button>
            )}
          </div>
        </div>

        {/* Form Sheet */}
        <Sheet open={showForm} onOpenChange={setShowForm}>
          <SheetContent className="w-full sm:max-w-2xl overflow-y-auto border-l border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-10">
            <SheetHeader className="pb-6 border-b border-slate-100 dark:border-slate-800 mb-8">
              <SheetTitle className="font-heading text-2xl">
                {editingConcert ? "Edit Concert Details" : "New Concert Setup"}
              </SheetTitle>
              <SheetDescription className="text-base">
                {editingConcert
                  ? "Update the information for this event below."
                  : "Fill in the details to list a new concert."}
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-6">
              <ConcertForm
                concert={editingConcert ?? undefined}
                onSubmit={editingConcert ? handleUpdate : handleCreate}
                isEdit={!!editingConcert}
              />
              <Button
                variant="ghost"
                className="w-full text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={handleCancelForm}
              >
                Cancel and Discard
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        {isLoading ? (
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-6 animate-pulse"
              >
                <div className="flex gap-4">
                  <div className="flex-1 space-y-4">
                    <Skeleton className="h-6 w-1/3 rounded-lg" />
                    <Skeleton className="h-4 w-full rounded-md" />
                    <Skeleton className="h-4 w-2/3 rounded-md" />
                  </div>
                  <Skeleton className="h-10 w-24 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : concerts.length === 0 ? (
          <Card className="text-center py-20 border-dashed border-2 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 rounded-3xl">
            <CardContent className="flex flex-col items-center justify-center">
              <div className="w-24 h-24 mb-6 relative">
                <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping opacity-75" />
                <div className="relative bg-white dark:bg-slate-800 w-full h-full rounded-full flex items-center justify-center border shadow-sm">
                  <Calendar className="w-10 h-10 text-primary/60" />
                </div>
              </div>
              <h2 className="text-2xl font-bold font-heading mb-3">No Concerts Scheduled</h2>
              <p className="text-muted-foreground mb-8 max-w-sm text-lg">
                Your venue is quiet. Get the party started by adding your first concert listing today.
              </p>
              <Button
                onClick={() => setShowForm(true)}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md gap-2 rounded-xl"
              >
                <Plus className="w-5 h-5" />
                Create Concert
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Desktop Table View */}
            <Card className="hidden md:block overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[40%] font-semibold py-5 px-6">Event Details</TableHead>
                      <TableHead className="font-semibold py-5">Status</TableHead>
                      <TableHead className="font-semibold py-5">Ticketing</TableHead>
                      <TableHead className="text-right font-semibold py-5 px-6">Manage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {concerts.map((concert) => {
                      const availabilityPercent =
                        (concert.availableSeats / concert.totalSeats) * 100;
                      const isSoldOut = concert.availableSeats === 0;

                      return (
                        <TableRow 
                          key={concert.id}
                          className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800/60 last:border-0"
                        >
                          <TableCell className="px-6 py-5">
                            <div className="flex gap-4 items-center">
                              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center shrink-0 border border-indigo-500/20">
                                <Music className="w-5 h-5 text-indigo-500" />
                              </div>
                              <div>
                                <p className="font-bold text-base text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">
                                  {concert.name}
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5 max-w-md">
                                  {concert.description}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-5">
                            <Badge
                              variant={isSoldOut ? "destructive" : "default"}
                              className={cn(
                                "rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wider",
                                !isSoldOut && "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-200",
                                isSoldOut && "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 hover:bg-rose-200"
                              )}
                            >
                              {isSoldOut ? "Sold Out" : "Tickets Available"}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-5">
                            <div className="w-48">
                              <div className="flex items-center justify-between text-xs mb-2 font-medium gap-2">
                                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 whitespace-nowrap">
                                  <Ticket className="w-3.5 h-3.5 shrink-0" />
                                  Capacity
                                </span>
                                <span className="text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                  {concert.availableSeats} / {concert.totalSeats}
                                </span>
                              </div>
                              <Progress
                                value={availabilityPercent}
                                className={cn(
                                  "h-2",
                                  isSoldOut ? "bg-rose-100 dark:bg-rose-950" : "bg-slate-100 dark:bg-slate-800"
                                )}
                              />
                            </div>
                          </TableCell>
                          <TableCell className="text-right px-6 py-5">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(concert)}
                                className="h-9 px-3 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary transition-colors gap-2"
                              >
                                <Edit className="w-4 h-4" />
                                <span className="hidden lg:inline">Edit</span>
                              </Button>
                              <AlertDialog
                                open={deleteConfirmId === concert.id}
                                onOpenChange={(open) =>
                                  setDeleteConfirmId(open ? concert.id : null)
                                }
                              >
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-9 w-9 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 border-rose-200 dark:border-rose-900 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="rounded-2xl">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="flex items-center gap-2 text-rose-600">
                                      <Trash2 className="w-5 h-5" />
                                      Delete Concert
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="text-base pt-2">
                                      Are you sure you want to permanently delete <span className="font-semibold text-slate-900 dark:text-white">&quot;{concert.name}&quot;</span>? All associated data will be removed.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter className="mt-6">
                                    <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(concert.id)}
                                      className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm"
                                    >
                                      {submittingId === concert.id
                                        ? "Deleting..."
                                        : "Yes, Delete Concert"}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </Card>

            {/* Mobile Card View */}
            <div className="md:hidden grid gap-4">
              {concerts.map((concert) => {
                const availabilityPercent =
                  (concert.availableSeats / concert.totalSeats) * 100;
                const isSoldOut = concert.availableSeats === 0;

                return (
                  <Card key={concert.id} className="rounded-2xl overflow-hidden shadow-sm border-slate-200 dark:border-slate-800">
                    <CardHeader className="pb-4 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-3 items-center">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Music className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-base font-bold leading-tight">
                              {concert.name}
                            </CardTitle>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-xl p-2">
                            <DropdownMenuItem
                              onClick={() => handleEdit(concert)}
                              className="rounded-lg py-2 cursor-pointer"
                            >
                              <Edit className="w-4 h-4 mr-3 text-slate-500" />
                              Edit Concert
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeleteConfirmId(concert.id)}
                              className="text-rose-600 focus:text-rose-700 focus:bg-rose-50 dark:focus:bg-rose-950/30 rounded-lg py-2 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4 mr-3" />
                              Delete Concert
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-5">
                        {concert.description}
                      </p>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Badge
                            variant={isSoldOut ? "destructive" : "default"}
                            className={cn(
                              "rounded-lg px-2.5 py-1 text-xs font-semibold uppercase tracking-wide",
                              !isSoldOut && "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-200 border-0"
                            )}
                          >
                            {isSoldOut ? "Sold Out" : "Available"}
                          </Badge>
                          <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300">
                            <Ticket className="w-4 h-4 text-slate-400" />
                            {concert.availableSeats} <span className="text-slate-400 font-normal">/ {concert.totalSeats}</span>
                          </div>
                        </div>
                        <Progress 
                          value={availabilityPercent} 
                          className={cn("h-1.5", isSoldOut ? "bg-rose-100 dark:bg-rose-950" : "bg-slate-100 dark:bg-slate-800")}
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Mobile Delete Confirmation */}
            <AlertDialog
              open={!!deleteConfirmId}
              onOpenChange={(open) =>
                setDeleteConfirmId(open ? deleteConfirmId : null)
              }
            >
              <AlertDialogContent className="rounded-2xl max-w-[90vw]">
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2 text-rose-600">
                    <Trash2 className="w-5 h-5" />
                    Delete Concert
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-base pt-2">
                    Are you sure you want to permanently delete this concert? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-6 flex-col sm:flex-row gap-2">
                  <AlertDialogCancel 
                    onClick={() => setDeleteConfirmId(null)}
                    className="rounded-xl sm:mt-0 w-full sm:w-auto"
                  >
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() =>
                      deleteConfirmId && handleDelete(deleteConfirmId)
                    }
                    className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm w-full sm:w-auto"
                  >
                    {submittingId ? "Deleting..." : "Yes, Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
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

