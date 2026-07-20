'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button, Heading } from '@/components/ui';
import { useSportsList } from '../hooks/useSportsList';
import { useToggleSportsListed } from '../hooks/useToggleSportsListed';
import type { SportsType } from '../types';
import { SportsFilters } from './SportsFilters';
import { SportsFormModal } from './SportsFormModal';
import { SportsTable } from './SportsTable';

export function AdminSportsPage() {
  const {
    items,
    totalPages,
    page,
    setPage,
    search,
    setSearch,
    isListedFilter,
    setIsListedFilter,
    isLoading,
    refetch,
  } = useSportsList();
  const { toggle, togglingId } = useToggleSportsListed(refetch);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SportsType | null>(null);

  const openAddModal = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const openEditModal = (item: SportsType) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: 24 }}>
        <Heading variant="h1">Sports</Heading>
        <Button type="button" onClick={openAddModal}>
          <Plus className="h-4 w-4" />
          Add Sport
        </Button>
      </div>

      <SportsFilters
        search={search}
        onSearchChange={setSearch}
        isListedFilter={isListedFilter}
        onIsListedFilterChange={setIsListedFilter}
      />

      <SportsTable
        items={items}
        isLoading={isLoading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        onEdit={openEditModal}
        onToggleListed={(item) => void toggle(item.id, !item.isListed)}
        togglingId={togglingId}
      />

      <SportsFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        existing={editingItem}
        onSuccess={refetch}
      />
    </div>
  );
}
