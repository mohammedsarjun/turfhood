'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Heading, Spinner, Text } from '@/components/ui';
import type { CatalogItem } from '@turfhood/shared';
import { useMyApplications } from '../hooks/useMyApplications';
import { listPublicAmenities, listPublicSportsTypes } from '../actions/catalogApi';
import { TurfCard } from './TurfCard';
import { TurfDetailModal } from './TurfDetailModal';
import type { TurfApplicationSummary } from '../types';

function toNamesById(items: CatalogItem[]): Record<string, string> {
  return Object.fromEntries(items.map((item) => [item.id, item.name]));
}

/** Lists every turf-owner application the user has ever submitted (any status) as cards. */
export function MyTurfsPage() {
  const { applications, isLoading, error } = useMyApplications();
  const [selected, setSelected] = useState<TurfApplicationSummary | null>(null);
  const [sportNamesById, setSportNamesById] = useState<Record<string, string>>({});
  const [amenityNamesById, setAmenityNamesById] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;

    async function fetchCatalogs() {
      try {
        const [sports, amenities] = await Promise.all([
          listPublicSportsTypes(),
          listPublicAmenities(),
        ]);
        if (cancelled) return;
        setSportNamesById(toNamesById(sports.items));
        setAmenityNamesById(toNamesById(amenities.items));
      } catch {
        // Non-critical: falls back to showing raw ids in the detail modal.
      }
    }

    void fetchCatalogs();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl" style={{ padding: 24 }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 24 }}>
          <Heading variant="display">My Turfs</Heading>
          <Link
            href="/become-a-turf-owner/apply"
            className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            style={{ gap: 8 }}
          >
            <Plus className="h-4 w-4" />
            Add Turf
          </Link>
        </div>

        {isLoading && (
          <div className="flex justify-center" style={{ paddingTop: 48 }}>
            <Spinner />
          </div>
        )}

        {error && (
          <Text className="text-destructive" role="alert">
            {error}
          </Text>
        )}

        {!isLoading && !error && applications.length === 0 && (
          <Text className="text-muted-foreground">
            You haven&apos;t submitted any turfs yet. Click &quot;Add Turf&quot; to get started.
          </Text>
        )}

        {!isLoading && applications.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {applications.map((application) => (
              <TurfCard
                key={application.id}
                application={application}
                onClick={() => setSelected(application)}
              />
            ))}
          </div>
        )}
      </div>

      <TurfDetailModal
        application={selected}
        onClose={() => setSelected(null)}
        sportNamesById={sportNamesById}
        amenityNamesById={amenityNamesById}
      />
    </div>
  );
}
