'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui';
import { addFavorite, listFavoriteIds, removeFavorite } from '../actions/favoriteApi';

let favoriteIds: Set<string> | null = null;
let loadingPromise: Promise<void> | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function loadFavorites() {
  if (favoriteIds) return Promise.resolve();
  if (!loadingPromise) {
    loadingPromise = listFavoriteIds()
      .then((ids) => {
        favoriteIds = new Set(ids);
        notify();
      })
      .finally(() => {
        loadingPromise = null;
      });
  }
  return loadingPromise;
}

export function useFavoriteTurf(turfId: string) {
  const [, render] = useState(0);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const listener = () => render((value) => value + 1);
    listeners.add(listener);
    void loadFavorites().catch(() => undefined);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const favorite = favoriteIds?.has(turfId) ?? false;
  const toggle = async () => {
    if (saving) return;
    const wasFavorite = favorite;
    favoriteIds ??= new Set();
    if (wasFavorite) favoriteIds.delete(turfId);
    else favoriteIds.add(turfId);
    notify();
    setSaving(true);
    try {
      if (wasFavorite) await removeFavorite(turfId);
      else await addFavorite(turfId);
      showToast(wasFavorite ? 'Removed from favourites.' : 'Added to favourites.');
    } catch {
      if (wasFavorite) favoriteIds.add(turfId);
      else favoriteIds.delete(turfId);
      notify();
      showToast('Unable to update favourites.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return { favorite, saving, toggle };
}
