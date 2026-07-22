'use client';

import { Badge, Modal, Text } from '@/components/ui';
import { TurfImageGallery } from '@/components/shared';
import { TURF_APPLICATION_STATUS_COPY } from '../lib/turfApplicationStatusCopy';
import type { TurfApplicationSummary } from '../types';

export interface TurfDetailModalProps {
  application: TurfApplicationSummary | null;
  onClose: () => void;
  /** Catalog id -> display name, so sportsOffered/amenities (stored as ids) render as readable names. */
  sportNamesById?: Record<string, string>;
  amenityNamesById?: Record<string, string>;
}

/** Big modal shown when a turf card is clicked: main photo + thumbnail strip, full address/sports/amenities/status. */
export function TurfDetailModal({
  application,
  onClose,
  sportNamesById = {},
  amenityNamesById = {},
}: TurfDetailModalProps) {
  if (!application) return null;

  const statusCopy = TURF_APPLICATION_STATUS_COPY[application.status];

  return (
    <Modal open={Boolean(application)} onClose={onClose} title={application.name} className="max-w-2xl">
      <TurfImageGallery
        images={application.images ?? []}
        altText={application.name}
        className="mb-4"
      />

      <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
        <Badge variant={statusCopy.badge}>{statusCopy.label}</Badge>
      </div>

      <Text style={{ marginBottom: 8 }}>{statusCopy.message}</Text>
      {application.status === 'rejected' && application.reviewNotes && (
        <Text style={{ marginBottom: 8 }}>
          <strong>Reason:</strong> {application.reviewNotes}
        </Text>
      )}

      {application.description && <Text style={{ marginBottom: 8 }}>{application.description}</Text>}

      <Text style={{ marginBottom: 4 }}>
        <strong>Address:</strong> {application.address.line1}, {application.address.city},{' '}
        {application.address.state}, {application.address.country} - {application.address.pincode}
      </Text>

      {application.sportsOffered.length > 0 && (
        <Text style={{ marginBottom: 4 }}>
          <strong>Sports:</strong>{' '}
          {application.sportsOffered.map((id) => sportNamesById[id] ?? id).join(', ')}
        </Text>
      )}

      {application.amenities.length > 0 && (
        <Text>
          <strong>Amenities:</strong>{' '}
          {application.amenities.map((id) => amenityNamesById[id] ?? id).join(', ')}
        </Text>
      )}
    </Modal>
  );
}
