export interface TurfImageProps {
  id?: string;
  turfId: string;
  url: string;
  isCover: boolean;
  order: number;
  createdAt?: Date;
}

/**
 * Core TurfImage entity — mirrors the `turf_images` collection. Kept as its own collection
 * (not embedded on Turf) per the DB design note: owners may have many images, managed
 * independently of the turf document itself.
 */
export class TurfImage {
  private constructor(private readonly props: TurfImageProps) {}

  static create(input: { turfId: string; url: string; isCover: boolean; order: number }): TurfImage {
    return new TurfImage(input);
  }

  static fromPersistence(props: TurfImageProps): TurfImage {
    return new TurfImage(props);
  }

  get id(): string | undefined {
    return this.props.id;
  }

  get turfId(): string {
    return this.props.turfId;
  }

  get url(): string {
    return this.props.url;
  }

  get isCover(): boolean {
    return this.props.isCover;
  }

  get order(): number {
    return this.props.order;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }
}
