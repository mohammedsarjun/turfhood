export interface AmenityProps {
  id?: string;
  name: string;
  icon?: string;
  isListed: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/** Core Amenity entity — mirrors the `amenities` collection's business-relevant fields. */
export class Amenity {
  private constructor(private readonly props: AmenityProps) {}

  /** Creates a brand-new amenity, listed by default. An icon is mandatory going forward. */
  static create(input: { name: string; icon: string }): Amenity {
    return new Amenity({
      name: input.name,
      icon: input.icon,
      isListed: true,
    });
  }

  /** Rehydrates an Amenity entity from persisted data. */
  static fromPersistence(props: AmenityProps): Amenity {
    return new Amenity(props);
  }

  get id(): string | undefined {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get icon(): string | undefined {
    return this.props.icon;
  }

  get isListed(): boolean {
    return this.props.isListed;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }
}
