import type { GeoPoint } from '@turfhood/shared';

export interface TurfAddress {
  line1: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
}

export interface TurfAmenityRef {
  amenityId: string;
  name: string;
}

export type TurfStatus = 'pending_approval' | 'approved' | 'rejected' | 'suspended';

export interface TurfRating {
  avg: number;
  count: number;
}

export interface TurfProps {
  id?: string;
  ownerId: string;
  name: string;
  description?: string;
  location: GeoPoint;
  address: TurfAddress;
  amenities: TurfAmenityRef[];
  sportsOffered: string[];
  rating: TurfRating;
  status: TurfStatus;
  verificationId?: string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/** Core Turf entity — mirrors the `turfs` collection's business-relevant fields. */
export class Turf {
  private constructor(private readonly props: TurfProps) {}

  /**
   * Creates a Turf directly in `approved` status — this app creates the Turf only once an
   * admin has approved the owner's application, so there's no separate pending-Turf stage.
   */
  static create(input: {
    ownerId: string;
    name: string;
    description?: string;
    location: GeoPoint;
    address: TurfAddress;
    amenities: TurfAmenityRef[];
    sportsOffered: string[];
    verificationId?: string;
  }): Turf {
    return new Turf({
      ownerId: input.ownerId,
      name: input.name,
      ...(input.description ? { description: input.description } : {}),
      location: input.location,
      address: input.address,
      amenities: input.amenities,
      sportsOffered: input.sportsOffered,
      rating: { avg: 0, count: 0 },
      status: 'approved',
      ...(input.verificationId ? { verificationId: input.verificationId } : {}),
      isDeleted: false,
    });
  }

  /** Rehydrates a Turf entity from persisted data. */
  static fromPersistence(props: TurfProps): Turf {
    return new Turf(props);
  }

  get id(): string | undefined {
    return this.props.id;
  }

  get ownerId(): string {
    return this.props.ownerId;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get location(): GeoPoint {
    return this.props.location;
  }

  get address(): TurfAddress {
    return this.props.address;
  }

  get amenities(): TurfAmenityRef[] {
    return this.props.amenities;
  }

  get sportsOffered(): string[] {
    return this.props.sportsOffered;
  }

  get rating(): TurfRating {
    return this.props.rating;
  }

  get status(): TurfStatus {
    return this.props.status;
  }

  get verificationId(): string | undefined {
    return this.props.verificationId;
  }

  get isDeleted(): boolean {
    return this.props.isDeleted;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }
}
