import multer from 'multer';

/** Parses a single `avatar` multipart field into memory — the use case does the disk write via IFileStorageService. */
export const uploadAvatar = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('avatar');
