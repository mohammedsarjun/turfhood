import type { GeoPoint } from '@turfhood/shared';
import type { TurfAddress } from '@domain/turf/entities/Turf';

export type TurfOwnerApplicationStatus = 'pending' | 'approved' | 'rejected';

export interface TurfOwnerApplicationDocument {
  type: string;
  url: string;
}

export interface TurfOwnerApplicationImage {
  url: string;
  isCover: boolean;
}

export interface TurfOwnerApplicationProps {
  id?: string;
  applicantUserId: string;
  name: string;
  description?: string;
  address: TurfAddress;
  location: GeoPoint;
  sportsOffered: string[];
  amenities: string[];
  documents: TurfOwnerApplicationDocument[];
  images: TurfOwnerApplicationImage[];
  status: TurfOwnerApplicationStatus;
  reviewedBy?: string;
  reviewNotes?: string;
  turfId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Carries the full turf-to-be data plus verification documents and review state. Unlike the DB
 * design's `turf_owner_verifications` (which assumes an existing `turfId`), this entity exists
 * before any Turf record does — the Turf is only created once this application is approved.
 */
export class TurfOwnerApplication {
  private constructor(private readonly props: TurfOwnerApplicationProps) {}

  /** Creates a brand-new application, always starting `pending`. */
  static create(input: {
    applicantUserId: string;
    name: string;
    description?: string;
    address: TurfAddress;
    location: GeoPoint;
    sportsOffered: string[];
    amenities: string[];
    documents: TurfOwnerApplicationDocument[];
    images: TurfOwnerApplicationImage[];
  }): TurfOwnerApplication {
    return new TurfOwnerApplication({
      applicantUserId: input.applicantUserId,
      name: input.name,
      ...(input.description ? { description: input.description } : {}),
      address: input.address,
      location: input.location,
      sportsOffered: input.sportsOffered,
      amenities: input.amenities,
      documents: input.documents,
      images: input.images,
      status: 'pending',
    });
  }

  /** Rehydrates a TurfOwnerApplication entity from persisted data. */
  static fromPersistence(props: TurfOwnerApplicationProps): TurfOwnerApplication {
    return new TurfOwnerApplication(props);
  }

  get id(): string | undefined {
    return this.props.id;
  }

  get applicantUserId(): string {
    return this.props.applicantUserId;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get address(): TurfAddress {
    return this.props.address;
  }

  get location(): GeoPoint {
    return this.props.location;
  }

  get sportsOffered(): string[] {
    return this.props.sportsOffered;
  }

  get amenities(): string[] {
    return this.props.amenities;
  }

  get documents(): TurfOwnerApplicationDocument[] {
    return this.props.documents;
  }

  get images(): TurfOwnerApplicationImage[] {
    return this.props.images;
  }

  get status(): TurfOwnerApplicationStatus {
    return this.props.status;
  }

  get reviewedBy(): string | undefined {
    return this.props.reviewedBy;
  }

  get reviewNotes(): string | undefined {
    return this.props.reviewNotes;
  }

  get turfId(): string | undefined {
    return this.props.turfId;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }
}
