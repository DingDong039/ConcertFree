// frontend/src/widgets/concert-form/ui/ConcertForm.tsx
'use client';

import { useState } from 'react';
import { z } from 'zod';
import { Button, Input, Label } from '@/shared/ui';
import type { Concert, CreateConcertPayload } from '@/entities/concert';

const concertSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  totalSeats: z.number().min(1, 'At least 1 seat is required'),
});

interface ConcertFormProps {
  concert?: Concert;
  onSubmit: (data: CreateConcertPayload) => Promise<void>;
  isLoading?: boolean;
  isEdit?: boolean;
}

export function ConcertForm({ concert, onSubmit, isLoading, isEdit = false }: ConcertFormProps) {
  const [formData, setFormData] = useState<CreateConcertPayload>({
    name: concert?.name || '',
    description: concert?.description || '',
    totalSeats: concert?.totalSeats || 100,
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'totalSeats' ? parseInt(value) || 0 : value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      concertSchema.parse(formData);
      await onSubmit(formData);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.issues[0].message);
      } else if (err instanceof Error) {
        setError(err.message);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Concert Name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="Enter concert name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          name="description"
          placeholder="Enter concert description"
          value={formData.description}
          onChange={handleChange}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="totalSeats">Total Seats</Label>
        <Input
          id="totalSeats"
          name="totalSeats"
          type="number"
          min={1}
          placeholder="Enter total seats"
          value={formData.totalSeats}
          onChange={handleChange}
          required
        />
      </div>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button type="submit" className="flex-1" disabled={isLoading}>
          {isLoading
            ? isEdit
              ? 'Updating...'
              : 'Creating...'
            : isEdit
              ? 'Update Concert'
              : 'Create Concert'}
        </Button>
      </div>
    </form>
  );
}
