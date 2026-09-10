import type { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import type { ITurfRepository } from '@domain/turf/repositories/ITurfRepository';
import type { ITurfImageRepository } from '@domain/turf/repositories/ITurfImageRepository';
import type { IFileStorageService } from '@domain/shared/services/IFileStorageService';
import { TURF_TOKENS } from '@domain/turf/tokens';
import { SHARED_TOKENS } from '@domain/shared/tokens';
import type { AuthenticatedRequest } from '@presentation/shared/middlewares/authenticate';
import { AppError } from '@shared/errors/AppError';
import { HttpStatus } from '@shared/constants/httpStatus';
import type { ValidatedOwnerTurfRequest } from '../validators/ownerTurfValidators.js';
import { env } from '@config/env';

const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

@injectable()
export class OwnerTurfController {
  constructor(
    @inject(TURF_TOKENS.TurfRepository) private readonly turfs: ITurfRepository,
    @inject(TURF_TOKENS.TurfImageRepository) private readonly images: ITurfImageRepository,
    @inject(SHARED_TOKENS.FileStorageService) private readonly files: IFileStorageService,
  ) {}

  private userId(req: Request) {
    const id = (req as AuthenticatedRequest).user?.userId;
    if (!id) throw new AppError('Authentication required.', HttpStatus.UNAUTHORIZED);
    return id;
  }

  details = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const turf = await this.turfs.findOwnedByIdOrVerificationId(
        req.params.id as string,
        this.userId(req),
      );
      if (!turf?.id) throw new AppError('Turf not found.', HttpStatus.NOT_FOUND);
      const imageMap = await this.images.findImageUrls([turf.id]);
      const [longitude, latitude] = turf.location.coordinates;
      res.status(HttpStatus.OK).json({
        turf: {
          id: turf.id,
          name: turf.name,
          description: turf.description ?? '',
          address: turf.address,
          location: { latitude, longitude },
          images: imageMap.get(turf.id) ?? [],
        },
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, description, address, location } = (req as ValidatedOwnerTurfRequest)
        .validatedOwnerTurf!;
      const cleanedDescription = typeof description === 'string' ? description.trim() : '';
      const turf = await this.turfs.updateBasicDetails(req.params.id as string, this.userId(req), {
        name: name.trim(),
        ...(cleanedDescription ? { description: cleanedDescription } : {}),
        address,
        location: { type: 'Point', coordinates: [location.longitude, location.latitude] },
      });
      if (!turf) throw new AppError('Turf not found.', HttpStatus.NOT_FOUND);
      res.status(HttpStatus.OK).json({ message: 'Turf details updated successfully.' });
    } catch (error) {
      next(error);
    }
  };

  cover = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const file = (req as Request & { file?: Express.Multer.File }).file;
      if (!file || !IMAGE_TYPES.has(file.mimetype))
        throw new AppError('Choose a JPEG, PNG, or WEBP image.', HttpStatus.BAD_REQUEST);
      const turf = await this.turfs.findOwnedByIdOrVerificationId(
        req.params.id as string,
        this.userId(req),
      );
      if (!turf?.id) throw new AppError('Turf not found.', HttpStatus.NOT_FOUND);
      const uploaded = await this.files.upload({
        buffer: file.buffer,
        filename: file.originalname,
        mimeType: file.mimetype,
        folder: 'turf-images',
        resourceType: 'image',
      });
      await this.images.replaceCover(turf.id, uploaded.url);
      res.status(HttpStatus.OK).json({ url: uploaded.url });
    } catch (error) {
      next(error);
    }
  };

  gallery = async (req: Request, res: Response, next: NextFunction) => {
    const uploadedUrls: string[] = [];
    try {
      const turf = await this.turfs.findOwnedByIdOrVerificationId(
        req.params.id as string,
        this.userId(req),
      );
      if (!turf?.id) throw new AppError('Turf not found.', HttpStatus.NOT_FOUND);
      const currentMap = await this.images.findImageUrls([turf.id]);
      const currentUrls = currentMap.get(turf.id) ?? [];
      let retainedUrls: unknown;
      try {
        retainedUrls = JSON.parse(String(req.body.retainedUrls ?? '[]'));
      } catch {
        retainedUrls = null;
      }
      if (
        !Array.isArray(retainedUrls) ||
        !retainedUrls.every((url) => typeof url === 'string' && currentUrls.includes(url))
      )
        throw new AppError('The selected turf photos are invalid.', HttpStatus.BAD_REQUEST);
      const files = (req as Request & { files?: Express.Multer.File[] }).files ?? [];
      if (files.some((file) => !IMAGE_TYPES.has(file.mimetype)))
        throw new AppError('Only JPEG, PNG, or WEBP images are allowed.', HttpStatus.BAD_REQUEST);
      const total = retainedUrls.length + files.length;
      if (total < 1 || total > 10)
        throw new AppError('Keep between 1 and 10 turf photos.', HttpStatus.BAD_REQUEST);
      const coverKey = String(req.body.coverKey ?? '');
      const existingCover = retainedUrls.includes(coverKey) ? coverKey : null;
      const newCoverMatch = /^new:(\d+)$/.exec(coverKey);
      const newCoverIndex = newCoverMatch ? Number(newCoverMatch[1]) : -1;
      if (!existingCover && (newCoverIndex < 0 || newCoverIndex >= files.length))
        throw new AppError('Choose exactly one cover photo.', HttpStatus.BAD_REQUEST);
      for (const file of files) {
        const uploaded = await this.files.upload({
          buffer: file.buffer,
          filename: file.originalname,
          mimeType: file.mimetype,
          folder: env.CLOUDINARY_TURF_IMAGE_FOLDER,
        });
        uploadedUrls.push(uploaded.url);
      }
      const nextImages = [
        ...retainedUrls.map((url) => ({ url, isCover: url === existingCover })),
        ...uploadedUrls.map((url, index) => ({ url, isCover: index === newCoverIndex })),
      ];
      await this.images.replaceAll(turf.id, nextImages);
      await Promise.all(
        currentUrls
          .filter((url) => !retainedUrls.includes(url))
          .map((url) => this.files.delete(url)),
      );
      res.status(HttpStatus.OK).json({
        images: [...nextImages]
          .sort((left, right) => Number(right.isCover) - Number(left.isCover))
          .map((image) => image.url),
      });
    } catch (error) {
      await Promise.all(uploadedUrls.map((url) => this.files.delete(url)));
      next(error);
    }
  };
}
