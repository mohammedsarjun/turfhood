import multer from 'multer';

/** Parses a single `icon` multipart field into memory — the use case does the Cloudinary upload via IFileStorageService. */
export const uploadSportsTypeIcon = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('icon');
