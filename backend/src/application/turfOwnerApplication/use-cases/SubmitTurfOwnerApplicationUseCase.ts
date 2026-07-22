import { inject, injectable } from 'tsyringe';
import { TurfOwnerApplication } from '@domain/turfOwnerApplication/entities/TurfOwnerApplication';
import { DuplicatePendingApplicationError } from '@domain/turfOwnerApplication/errors/DuplicatePendingApplicationError';
import { InvalidCoordinatesError } from '@domain/turfOwnerApplication/errors/InvalidCoordinatesError';
import { InvalidDocumentFileError } from '@domain/turfOwnerApplication/errors/InvalidDocumentFileError';
import { InvalidLocationError } from '@domain/turfOwnerApplication/errors/InvalidLocationError';
import { InvalidTurfImageError } from '@domain/turfOwnerApplication/errors/InvalidTurfImageError';
import type { ITurfOwnerApplicationRepository } from '@domain/turfOwnerApplication/repositories/ITurfOwnerApplicationRepository';
import { TURF_OWNER_APPLICATION_TOKENS } from '@domain/turfOwnerApplication/tokens';
import type { IFileStorageService } from '@domain/shared/services/IFileStorageService';
import { SHARED_TOKENS } from '@domain/shared/tokens';
import { isValidLocation, type TurfApplicationSummary } from '@turfhood/shared';
import { env } from '@config/env';

import type { SubmitTurfOwnerApplicationRequestDTO } from '../dtos/SubmitTurfOwnerApplicationRequestDTO.js';
import { toTurfApplicationSummaryDTO } from '../mappers/toTurfApplicationSummaryDTO.js';

import type { ISubmitTurfOwnerApplicationUseCase } from './ISubmitTurfOwnerApplicationUseCase.js';

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);
const ALLOWED_IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_IMAGES = 10;

/**
 * Submits a turf-owner application. Never upgrades the applicant's role or creates a Turf
 * record — that only happens once an admin approves it (see ApproveTurfOwnerApplicationUseCase).
 */
@injectable()
export class SubmitTurfOwnerApplicationUseCase implements ISubmitTurfOwnerApplicationUseCase {
  constructor(
    @inject(TURF_OWNER_APPLICATION_TOKENS.TurfOwnerApplicationRepository)
    private readonly applicationRepository: ITurfOwnerApplicationRepository,
    @inject(SHARED_TOKENS.FileStorageService)
    private readonly fileStorageService: IFileStorageService,
  ) {}

  async execute(request: SubmitTurfOwnerApplicationRequestDTO): Promise<TurfApplicationSummary> {
    const { address, coordinates } = request;

    if (!isValidLocation(address.country, address.state, address.city)) {
      throw new InvalidLocationError();
    }

    if (
      typeof coordinates.lat !== 'number' ||
      typeof coordinates.lng !== 'number' ||
      Number.isNaN(coordinates.lat) ||
      Number.isNaN(coordinates.lng) ||
      coordinates.lat < -90 ||
      coordinates.lat > 90 ||
      coordinates.lng < -180 ||
      coordinates.lng > 180
    ) {
      throw new InvalidCoordinatesError();
    }

    if (request.sportsOffered.length === 0) {
      throw new InvalidDocumentFileError('Select at least one sport offered at your turf.');
    }

    if (request.documents.length === 0) {
      throw new InvalidDocumentFileError('At least one verification document is required.');
    }
    for (const doc of request.documents) {
      if (!ALLOWED_MIME_TYPES.has(doc.mimeType)) {
        throw new InvalidDocumentFileError('Only JPEG, PNG, WEBP, or PDF files are allowed.');
      }
      if (doc.sizeBytes > MAX_SIZE_BYTES) {
        throw new InvalidDocumentFileError('Each document must be 5MB or smaller.');
      }
    }

    if (request.images.length === 0 || request.images.length > MAX_IMAGES) {
      throw new InvalidTurfImageError('Upload between 1 and 10 turf photos.');
    }
    const coverCount = request.images.filter((image) => image.isCover).length;
    if (coverCount !== 1) {
      throw new InvalidTurfImageError('Mark exactly one photo as the cover photo.');
    }
    for (const image of request.images) {
      if (!ALLOWED_IMAGE_MIME_TYPES.has(image.mimeType)) {
        throw new InvalidTurfImageError('Only JPEG, PNG, or WEBP images are allowed.');
      }
      if (image.sizeBytes > MAX_SIZE_BYTES) {
        throw new InvalidTurfImageError('Each photo must be 5MB or smaller.');
      }
    }

    const existingPending = await this.applicationRepository.findPendingByApplicant(
      request.applicantUserId,
    );
    if (existingPending) {
      throw new DuplicatePendingApplicationError();
    }

    const uploadedDocuments = await Promise.all(
      request.documents.map(async (doc) => {
        const { url } = await this.fileStorageService.upload({
          buffer: doc.buffer,
          filename: doc.filename,
          mimeType: doc.mimeType,
          folder: env.CLOUDINARY_TURF_DOCUMENT_FOLDER,
          resourceType: 'auto',
        });
        return { type: doc.type, url };
      }),
    );

    const uploadedImages = await Promise.all(
      request.images.map(async (image) => {
        const { url } = await this.fileStorageService.upload({
          buffer: image.buffer,
          filename: image.filename,
          mimeType: image.mimeType,
          folder: env.CLOUDINARY_TURF_IMAGE_FOLDER,
        });
        return { url, isCover: image.isCover };
      }),
    );

    const application = TurfOwnerApplication.create({
      applicantUserId: request.applicantUserId,
      name: request.name.trim(),
      ...(request.description ? { description: request.description.trim() } : {}),
      address,
      location: { type: 'Point', coordinates: [coordinates.lng, coordinates.lat] },
      sportsOffered: request.sportsOffered,
      amenities: request.amenities,
      images: uploadedImages,
      documents: uploadedDocuments,
    });

    const created = await this.applicationRepository.create(application);
    return toTurfApplicationSummaryDTO(created);
  }
}
