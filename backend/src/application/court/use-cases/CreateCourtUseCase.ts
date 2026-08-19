import { inject, injectable } from 'tsyringe';
import type { IFileStorageService } from '@domain/shared/services/IFileStorageService';
import { SHARED_TOKENS } from '@domain/shared/tokens';
import type { ITurfRepository } from '@domain/turf/repositories/ITurfRepository';
import { TURF_TOKENS } from '@domain/turf/tokens';
import type { ICourtRepository } from '@domain/court/repositories/ICourtRepository';
import { COURT_TOKENS } from '@domain/court/tokens';
import { CourtAccessError } from '@domain/court/errors/CourtAccessError';
import { DuplicateCourtNameError } from '@domain/court/errors/DuplicateCourtNameError';

import type { ICreateCourtUseCase } from './ICreateCourtUseCase.js';

@injectable()
export class CreateCourtUseCase implements ICreateCourtUseCase {
  constructor(
    @inject(COURT_TOKENS.CourtRepository) private readonly courts: ICourtRepository,
    @inject(TURF_TOKENS.TurfRepository) private readonly turfs: ITurfRepository,
    @inject(SHARED_TOKENS.FileStorageService) private readonly storage: IFileStorageService,
  ) {}

  async execute(input: Parameters<ICreateCourtUseCase['execute']>[0]) {
    const turf = await this.turfs.findOwnedByIdOrVerificationId(input.portalTurfId, input.ownerId);
    if (!turf?.id) throw new CourtAccessError();
    if (await this.courts.existsByName(turf.id, input.name)) {
      throw new DuplicateCourtNameError(input.name);
    }

    const uploaded = await Promise.all(
      input.images.map((image) =>
        this.storage.upload({
          buffer: image.buffer,
          filename: image.filename,
          mimeType: image.mimeType,
          folder: `courts/${turf.id}`,
        }),
      ),
    );
    try {
      return await this.courts.create({
        turfId: turf.id,
        name: input.name,
        sportTypeIds: input.sportTypeIds,
        capacity: input.capacity,
        status: input.status,
        allowOpenSessions: input.allowOpenSessions,
        minPlayersForOpenSession: input.minPlayersForOpenSession,
        slotDurationMinutes: input.slotDurationMinutes,
        pricingRules: input.pricingRules,
        images: uploaded.map(({ url }, index) => ({
          url,
          isCover: input.imageCoverFlags[index] ?? false,
          order: index,
        })),
      });
    } catch (error) {
      await Promise.all(uploaded.map(({ url }) => this.storage.delete(url)));
      throw error;
    }
  }
}
