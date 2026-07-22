'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button, Heading } from '@/components/ui';
import { useAmenitiesList } from '../hooks/useAmenitiesList';
import { useToggleAmenityListed } from '../hooks/useToggleAmenityListed';
import type { Amenity } from '../types';
import { AmenitiesFilters } from './AmenitiesFilters';
import { AmenitiesTable } from './AmenitiesTable';
import { AmenityFormModal } from './AmenityFormModal';

export function AdminAmenitiesPage() {
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
  } = useAmenitiesList();
  const { toggle, togglingId } = useToggleAmenityListed(refetch);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Amenity | null>(null);

  const openAddModal = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const openEditModal = (item: Amenity) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: 24 }}>
        <Heading variant="h1">Amenities</Heading>
        <Button type="button" onClick={openAddModal}>
          <Plus className="h-4 w-4" />
          Add Amenity
        </Button>
      </div>

      <AmenitiesFilters
        search={search}
        onSearchChange={setSearch}
        isListedFilter={isListedFilter}
        onIsListedFilterChange={setIsListedFilter}
      />

      <AmenitiesTable
        items={items}
        isLoading={isLoading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        onEdit={openEditModal}
        onToggleListed={(item) => void toggle(item.id, !item.isListed)}
        togglingId={togglingId}
      />

      <AmenityFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        existing={editingItem}
        onSuccess={refetch}
      />
    </div>
  );
}
