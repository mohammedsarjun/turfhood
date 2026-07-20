export interface UploadFileParams {
  buffer: Buffer;
  filename: string;
  mimeType: string;
  /** Cloudinary folder to upload into — callers decide (avatars, sports icons, amenity icons, …). */
  folder: string;
}

export interface UploadFileResult {
  url: string;
}

/** Storage abstraction for uploaded files (avatars, catalog icons, …) — swappable for S3/Cloudinary later. */
export interface IFileStorageService {
  upload(params: UploadFileParams): Promise<UploadFileResult>;
  /** Best-effort delete; implementations should not throw if the file is already gone. */
  delete(url: string): Promise<void>;
}
