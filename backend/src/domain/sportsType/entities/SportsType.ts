export interface SportsTypeProps {
  id?: string;
  name: string;
  icon?: string;
  isListed: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/** Core SportsType entity — mirrors the `sports_types` collection's business-relevant fields. */
export class SportsType {
  private constructor(private readonly props: SportsTypeProps) {}

  /** Creates a brand-new sports type, listed by default. An icon is mandatory going forward. */
  static create(input: { name: string; icon: string }): SportsType {
    return new SportsType({
      name: input.name,
      icon: input.icon,
      isListed: true,
    });
  }

  /** Rehydrates a SportsType entity from persisted data. */
  static fromPersistence(props: SportsTypeProps): SportsType {
    return new SportsType(props);
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
