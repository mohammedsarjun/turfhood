import type { TurfOwnerApplication } from '@domain/turfOwnerApplication/entities/TurfOwnerApplication';
import type { TurfApplicationSummary } from '@turfhood/shared';

export function toTurfApplicationSummaryDTO(
  application: TurfOwnerApplication,
): TurfApplicationSummary {
  return {
    id: application.id as string,
    ...(application.turfId ? { turfId: application.turfId } : {}),
    name: application.name,
    ...(application.description ? { description: application.description } : {}),
    address: application.address,
    location: application.location,
    sportsOffered: application.sportsOffered,
    amenities: application.amenities,
    documents: application.documents,
    images: application.images,
    status: application.status as TurfApplicationSummary['status'],
    ...(application.reviewNotes ? { reviewNotes: application.reviewNotes } : {}),
    createdAt: (application.createdAt as Date).toISOString(),
    updatedAt: (application.updatedAt as Date).toISOString(),
  };
}
