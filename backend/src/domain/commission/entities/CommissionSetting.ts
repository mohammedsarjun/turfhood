export interface CommissionSettingProps {
  basisPoints: number;
  updatedAt?: Date;
}

export class CommissionSetting {
  private constructor(private readonly props: CommissionSettingProps) {}

  static fromPercentage(percentage: number, updatedAt?: Date): CommissionSetting {
    return new CommissionSetting({
      basisPoints: Math.round(percentage * 100),
      ...(updatedAt ? { updatedAt } : {}),
    });
  }

  static fromPersistence(props: CommissionSettingProps): CommissionSetting {
    return new CommissionSetting(props);
  }

  get percentage(): number {
    return this.props.basisPoints / 100;
  }
  get basisPoints(): number {
    return this.props.basisPoints;
  }
  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }
}
