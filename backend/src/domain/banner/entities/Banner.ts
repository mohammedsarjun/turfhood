export interface BannerProps {
  id?: string;
  title: string;
  description: string;
  imageUrl: string;
  createdAt?: Date;
}

export class Banner {
  private constructor(private readonly props: BannerProps) {}

  static create(input: Omit<BannerProps, 'id' | 'createdAt'>): Banner {
    return new Banner({
      title: input.title.trim(),
      description: input.description.trim(),
      imageUrl: input.imageUrl,
    });
  }

  static fromPersistence(props: BannerProps): Banner {
    return new Banner(props);
  }

  get id() {
    return this.props.id;
  }
  get title() {
    return this.props.title;
  }
  get description() {
    return this.props.description;
  }
  get imageUrl() {
    return this.props.imageUrl;
  }
  get createdAt() {
    return this.props.createdAt;
  }
}
