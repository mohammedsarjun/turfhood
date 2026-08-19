'use client';

import { useEffect, useMemo, useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import { Button, Heading } from '@/components/ui';
import { SearchInput } from '@/components/table';
import { listPublicSportsTypes } from '@/features/turf-onboarding/actions/catalogApi';
import { useCourts } from '../hooks/useCourts';
import { CourtFormModal } from './CourtFormModal';
import { CourtsTable } from './CourtsTable';

export function CourtManagementPage({ turfId }: { turfId: string }) {
  const { items, page, setPage, totalPages, search, setSearch, isLoading, error, refetch } =
    useCourts(turfId);
  const [modalOpen, setModalOpen] = useState(false);
  const [sports, setSports] = useState<Array<{ id: string; name: string }>>([]);
  const sportNames = useMemo(
    () => Object.fromEntries(sports.map((sport) => [sport.id, sport.name])),
    [sports],
  );

  useEffect(() => {
    void listPublicSportsTypes().then((result) => setSports(result.items));
  }, []);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <Heading variant="h1">Court Management</Heading>
        <Button type="button" onClick={() => setModalOpen(true)}>
          <FiPlus size={16} />
          Add Courts
        </Button>
      </div>
      <div className="mb-4 max-w-sm">
        <SearchInput
          placeholder="Search courts..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>
      {error && (
        <p role="alert" className="mb-3 text-sm text-destructive">
          {error}
        </p>
      )}
      <CourtsTable
        turfId={turfId}
        courts={items}
        sportNames={sportNames}
        isLoading={isLoading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
      <CourtFormModal
        turfId={turfId}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={() => void refetch()}
      />
    </div>
  );
}
