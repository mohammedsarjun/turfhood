import multer from 'multer';

/**
 * Parses two named multipart file fields into memory — `documents` (verification proof, up to
 * 5) and `images` (turf listing photos, up to 10) — the use case does the Cloudinary upload via
 * IFileStorageService. First use of multer's `.fields()` in this codebase (prior uploads only
 * ever used `.single()`/`.array()` on one field).
 */
export const uploadTurfApplicationDocuments = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
}).fields([
  { name: 'documents', maxCount: 5 },
  { name: 'images', maxCount: 10 },
]);
