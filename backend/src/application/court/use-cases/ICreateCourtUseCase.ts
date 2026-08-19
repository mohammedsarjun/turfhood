import type { CourtDTO, CreateCourtFields } from '@turfhood/shared';

export interface CourtUploadInput {
  buffer: Buffer;
  filename: string;
  mimeType: string;
  sizeBytes: number;
}

export interface ICreateCourtUseCase {
  execute(
    input: CreateCourtFields & {
      portalTurfId: string;
      ownerId: string;
      images: CourtUploadInput[];
    },
  ): Promise<CourtDTO>;
}
