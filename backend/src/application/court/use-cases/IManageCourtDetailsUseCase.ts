import type { CourtDetailsResponse, CreateAvailabilityOverrideRequest, AvailabilityOverrideDTO, CourtDTO, UpdateCourtFields } from '@turfhood/shared';

export interface CourtAccessInput { portalTurfId: string; courtId: string; ownerId: string }
export interface IManageCourtDetailsUseCase {
  get(input: CourtAccessInput): Promise<CourtDetailsResponse>;
  createOverride(input: CourtAccessInput & CreateAvailabilityOverrideRequest): Promise<AvailabilityOverrideDTO>;
  updateOverride(input: CourtAccessInput & CreateAvailabilityOverrideRequest & { overrideId: string }): Promise<AvailabilityOverrideDTO>;
  deleteOverride(input: CourtAccessInput & { overrideId: string }): Promise<void>;
  update(input: CourtAccessInput & UpdateCourtFields): Promise<CourtDTO>;
}
