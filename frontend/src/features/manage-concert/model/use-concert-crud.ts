// frontend/src/features/manage-concert/model/use-concert-crud.ts
'use client';

import { useState, useCallback } from 'react';
import { concertApi, useConcertStore } from '@/entities/concert';
import type { CreateConcertPayload, UpdateConcertPayload } from '@/entities/concert';

export function useConcertCrud() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    setConcerts,
    addConcert,
    updateConcert,
    removeConcert,
  } = useConcertStore();

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const concerts = await concertApi.getAll();
      setConcerts(concerts);
      return concerts;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch concerts';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [setConcerts]);

  const create = useCallback(async (payload: CreateConcertPayload) => {
    setIsLoading(true);
    setError(null);

    try {
      const concert = await concertApi.create(payload);
      addConcert(concert);
      return concert;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create concert';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [addConcert]);

  const update = useCallback(async (id: string, payload: UpdateConcertPayload) => {
    setIsLoading(true);
    setError(null);

    try {
      const concert = await concertApi.update(id, payload);
      updateConcert(id, concert);
      return concert;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update concert';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [updateConcert]);

  const remove = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await concertApi.delete(id);
      removeConcert(id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete concert';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [removeConcert]);

  return {
    fetchAll,
    create,
    update,
    remove,
    isLoading,
    error,
    clearError: () => setError(null),
  };
}
