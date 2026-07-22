import { inject, injectable } from 'tsyringe';
import type { IAmenityRepository } from '@domain/amenity/repositories/IAmenityRepository';
import { AMENITY_TOKENS } from '@domain/amenity/tokens';
import { Turf } from '@domain/turf/entities/Turf';
import type { ITurfImageRepository } from '@domain/turf/repositories/ITurfImageRepository';
import type { ITurfRepository } from '@domain/turf/repositories/ITurfRepository';
import { TURF_TOKENS } from '@domain/turf/tokens';
import { ApplicationAlreadyReviewedError } from '@domain/turfOwnerApplication/errors/ApplicationAlreadyReviewedError';
import { TurfOwnerApplicationNotFoundError } from '@domain/turfOwnerApplication/errors/TurfOwnerApplicationNotFoundError';
import type { ITurfOwnerApplicationRepository } from '@domain/turfOwnerApplication/repositories/ITurfOwnerApplicationRepository';
import { TURF_OWNER_APPLICATION_TOKENS } from '@domain/turfOwnerApplication/tokens';
import type { IUserRepository } from '@domain/user/repositories/IUserRepository';
import { USER_TOKENS } from '@domain/user/tokens';
import type { TurfApplicationSummary } from '@turfhood/shared';

import type { ApproveTurfOwnerApplicationRequestDTO } from '../dtos/ApproveTurfOwnerApplicationRequestDTO.js';
import { toTurfApplicationSummaryDTO } from '../mappers/toTurfApplicationSummaryDTO.js';

import type { IApproveTurfOwnerApplicationUseCase } from './IApproveTurfOwnerApplicationUseCase.js';

/**
 * Approving an application is the only place a Turf record gets created and a user's role gets
 * upgraded — submission alone never does either (see SubmitTurfOwnerApplicationUseCase).
 */
@injectable()
export class ApproveTurfOwnerApplicationUseCase implements IApproveTurfOwnerApplicationUseCase {
  constructor(
    @inject(TURF_OWNER_APPLICATION_TOKENS.TurfOwnerApplicationRepository)
    private readonly applicationRepository: ITurfOwnerApplicationRepository,
    @inject(TURF_TOKENS.TurfRepository) private readonly turfRepository: ITurfRepository,
    @inject(TURF_TOKENS.TurfImageRepository)
    private readonly turfImageRepository: ITurfImageRepository,
    @inject(USER_TOKENS.UserRepository) private readonly userRepository: IUserRepository,
    @inject(AMENITY_TOKENS.AmenityRepository)
    private readonly amenityRepository: IAmenityRepository,
  ) {}

  async execute(request: ApproveTurfOwnerApplicationRequestDTO): Promise<TurfApplicationSummary> {
    const application = await this.applicationRepository.findById(request.applicationId);
    if (!application) {
      throw new TurfOwnerApplicationNotFoundError();
    }
    if (application.status !== 'pending') {
      throw new ApplicationAlreadyReviewedError();
    }

    const amenityRefs = await Promise.all(
      application.amenities.map(async (amenityId) => {
        const amenity = await this.amenityRepository.findById(amenityId);
        return { amenityId, name: amenity?.name ?? '' };
      }),
    );

    const turf = Turf.create({
      ownerId: application.applicantUserId,
      name: application.name,
      ...(application.description ? { description: application.description } : {}),
      location: application.location,
      address: application.address,
      amenities: amenityRefs,
      sportsOffered: application.sportsOffered,
    });
    const createdTurf = await this.turfRepository.create(turf);

    if (application.images.length > 0) {
      await this.turfImageRepository.createMany(createdTurf.id as string, application.images);
    }

    const updated = await this.applicationRepository.approve(
      request.applicationId,
      request.reviewedBy,
      createdTurf.id as string,
    );
    if (!updated) {
      throw new TurfOwnerApplicationNotFoundError();
    }

    await this.userRepository.addRole(application.applicantUserId, 'turf_owner');

    return toTurfApplicationSummaryDTO(updated);
  }
}
