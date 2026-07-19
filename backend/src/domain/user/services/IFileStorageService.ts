export interface UploadFileParams {
  buffer: Buffer;
  filename: string;
  mimeType: string;
}

export interface UploadFileResult {
  url: string;
}

/** Storage abstraction for user-uploaded files (e.g. avatars) — swappable for S3/Cloudinary later. */
export interface IFileStorageService {
  upload(params: UploadFileParams): Promise<UploadFileResult>;
  /** Best-effort delete; implementations should not throw if the file is already gone. */
  delete(url: string): Promise<void>;
}
