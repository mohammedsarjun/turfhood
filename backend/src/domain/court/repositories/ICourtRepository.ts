import type { AvailabilityOverrideDTO, CourtDTO, CreateAvailabilityOverrideRequest, CreateCourtFields, UpdateCourtFields } from '@turfhood/shared';

export interface CourtImageInput {
  url: string;
  isCover: boolean;
  order: number;
}

export interface ICreateCourtPersistenceInput extends Omit<CreateCourtFields, 'imageCoverFlags'> {
  turfId: string;
  images: CourtImageInput[];
}

export interface ICourtRepository {
  existsByName(turfId: string, name: string, excludeCourtId?: string): Promise<boolean>;
  create(input: ICreateCourtPersistenceInput): Promise<CourtDTO>;
  list(input: {
    turfId: string;
    page: number;
    limit: number;
    search?: string;
  }): Promise<{ items: CourtDTO[]; total: number }>;
  findByIdAndTurf(courtId: string, turfId: string): Promise<CourtDTO | null>;
  listOverrides(courtId: string): Promise<AvailabilityOverrideDTO[]>;
  createOverride(input: CreateAvailabilityOverrideRequest & { turfId: string; courtId: string }): Promise<AvailabilityOverrideDTO>;
  updateOverride(overrideId: string, courtId: string, input: CreateAvailabilityOverrideRequest): Promise<AvailabilityOverrideDTO | null>;
  deleteOverride(overrideId: string, courtId: string): Promise<boolean>;
  update(courtId: string, input: UpdateCourtFields): Promise<CourtDTO | null>;
}
