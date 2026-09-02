import type { PublicCourtDetailsResponse } from '@turfhood/shared';

export interface IGetPublicCourtDetailsUseCase {
  execute(turfId: string, courtId: string, today?: Date): Promise<PublicCourtDetailsResponse>;
}
