import { v2 as cloudinary } from 'cloudinary';
import { injectable } from 'tsyringe';
import type {
  IFileStorageService,
  UploadFileParams,
  UploadFileResult,
} from '@domain/shared/services/IFileStorageService';
import { env } from '@config/env';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

/** Extracts the public_id Cloudinary needs for deletion out of a delivery URL it previously returned. */
function publicIdFromUrl(url: string): string | null {
  const match = /\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/.exec(url);
  return match?.[1] ?? null;
}

@injectable()
export class CloudinaryFileStorageService implements IFileStorageService {
  async upload({
    buffer,
    mimeType,
    folder,
    resourceType,
  }: UploadFileParams): Promise<UploadFileResult> {
    const dataUri = `data:${mimeType};base64,${buffer.toString('base64')}`;
    const result = await cloudinary.uploader.upload(dataUri, {
      folder,
      resource_type: resourceType ?? 'image',
    });
    return { url: result.secure_url };
  }

  async delete(url: string): Promise<void> {
    const publicId = publicIdFromUrl(url);
    if (!publicId) return;
    await cloudinary.uploader.destroy(publicId).catch(() => undefined);
  }
}
