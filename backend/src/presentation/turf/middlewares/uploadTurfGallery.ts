import multer from 'multer';

export const uploadTurfGallery = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 10 },
}).array('images', 10);
