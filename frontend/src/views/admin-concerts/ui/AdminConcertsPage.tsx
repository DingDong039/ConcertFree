// frontend/src/views/admin-concerts/ui/AdminConcertsPage.tsx
'use client';

import { useEffect, useState } from 'react';
import {
  Plus,
  RefreshCw,
  Music,
  Edit,
  Trash2,
  Calendar,
  Users,
  MoreHorizontal,
} from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
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
} from '@/shared/ui';
import { ConcertForm } from '@/widgets/concert-form';
import { concertApi, type Concert, type CreateConcertPayload } from '@/entities/concert';
import { cn } from '@/shared/lib';

export function AdminConcertsPage() {
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingConcert, setEditingConcert] = useState<Concert | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchConcerts = async () => {
    try {
      setIsLoading(true);
      const data = await concertApi.getAll();
      setConcerts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load concerts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConcerts();
  }, []);

  const handleCreate = async (data: CreateConcertPayload) => {
    try {
      const concert = await concertApi.create(data);
      setConcerts((prev) => [...prev, concert]);
      setShowForm(false);
    } catch (err) {
      throw err;
    }
  };

  const handleUpdate = async (data: CreateConcertPayload) => {
    if (!editingConcert) return;
    try {
      const concert = await concertApi.update(editingConcert.id, data);
      setConcerts((prev) =>
        prev.map((c) => (c.id === concert.id ? concert : c))
      );
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
      setConcerts((prev) => prev.filter((c) => c.id !== id));
      setDeleteConfirmId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete concert');
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
    fetchConcerts();
  };

  if (error && !isLoading) {
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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-heading font-bold">
                Manage Concerts
              </h1>
              <p className="text-muted-foreground">
                Create, edit, and manage concert listings
              </p>
            </div>
          </div>

          {!showForm && (
            <Button
              onClick={() => setShowForm(true)}
              className="bg-cta hover:bg-cta-hover text-white gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Concert
            </Button>
          )}
        </div>

        {/* Form Sheet */}
        <Sheet open={showForm} onOpenChange={setShowForm}>
          <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="font-heading">
                {editingConcert ? 'Edit Concert' : 'Create New Concert'}
              </SheetTitle>
              <SheetDescription>
                {editingConcert
                  ? 'Update the concert details below'
                  : 'Fill in the concert details below'}
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <ConcertForm
                concert={editingConcert ?? undefined}
                onSubmit={editingConcert ? handleUpdate : handleCreate}
                isEdit={!!editingConcert}
              />
              <Button
                variant="outline"
                className="mt-4 w-full"
                onClick={handleCancelForm}
              >
                Cancel
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                <Skeleton className="h-6 w-1/3 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        ) : concerts.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Music className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No Concerts Yet</h2>
              <p className="text-muted-foreground mb-6">
                Create your first concert listing to get started
              </p>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-cta hover:bg-cta-hover text-white gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Concert
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Desktop Table View */}
            <Card className="hidden md:block overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Concert</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Availability</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {concerts.map((concert) => {
                    const availabilityPercent =
                      (concert.availableSeats / concert.totalSeats) * 100;
                    const isSoldOut = concert.availableSeats === 0;

                    return (
                      <TableRow key={concert.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{concert.name}</p>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {concert.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={isSoldOut ? 'destructive' : 'default'}
                            className={cn(
                              !isSoldOut && 'bg-emerald-500 hover:bg-emerald-600'
                            )}
                          >
                            {isSoldOut ? 'Sold Out' : 'Available'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="w-32">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-muted-foreground">Seats</span>
                              <span>{concert.availableSeats}/{concert.totalSeats}</span>
                            </div>
                            <Progress value={availabilityPercent} className="h-1.5" />
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(concert)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <AlertDialog
                              open={deleteConfirmId === concert.id}
                              onOpenChange={(open) =>
                                setDeleteConfirmId(open ? concert.id : null)
                              }
                            >
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Concert</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete &quot;{concert.name}&quot;?
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(concert.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    {submittingId === concert.id
                                      ? 'Deleting...'
                                      : 'Delete'}
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
            </Card>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {concerts.map((concert) => {
                const availabilityPercent =
                  (concert.availableSeats / concert.totalSeats) * 100;
                const isSoldOut = concert.availableSeats === 0;

                return (
                  <Card key={concert.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{concert.name}</CardTitle>
                          <CardDescription className="line-clamp-2">
                            {concert.description}
                          </CardDescription>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(concert)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeleteConfirmId(concert.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-3">
                        <Badge
                          variant={isSoldOut ? 'destructive' : 'default'}
                          className={cn(
                            !isSoldOut && 'bg-emerald-500 hover:bg-emerald-600'
                          )}
                        >
                          {isSoldOut ? 'Sold Out' : 'Available'}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Users className="w-4 h-4" />
                          {concert.availableSeats}/{concert.totalSeats}
                        </div>
                      </div>
                      <Progress value={availabilityPercent} className="h-2" />
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Mobile Delete Confirmation */}
            <AlertDialog
              open={!!deleteConfirmId}
              onOpenChange={(open) => setDeleteConfirmId(open ? deleteConfirmId : null)}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Concert</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this concert? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setDeleteConfirmId(null)}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {submittingId ? 'Deleting...' : 'Delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </div>
    </div>
  );
}
