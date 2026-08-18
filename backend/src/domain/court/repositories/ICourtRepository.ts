import type { CourtDTO, CreateCourtFields } from '@turfhood/shared';

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
  existsByName(turfId: string, name: string): Promise<boolean>;
  create(input: ICreateCourtPersistenceInput): Promise<CourtDTO>;
  list(input: {
    turfId: string;
    page: number;
    limit: number;
    search?: string;
  }): Promise<{ items: CourtDTO[]; total: number }>;
}
