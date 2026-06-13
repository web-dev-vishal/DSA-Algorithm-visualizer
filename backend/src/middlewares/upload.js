import multer from 'multer';
import path from 'path';
import { BadRequestError } from '../errors/ApiError.js';

// Allowed MIME types and their corresponding extensions
const ALLOWED_MIME_TYPES = new Map([
  ['image/jpeg', ['.jpg', '.jpeg']],
  ['image/png', ['.png']],
  ['image/gif', ['.gif']],
  ['image/webp', ['.webp']],
  ['application/pdf', ['.pdf']]
]);

/**
 * Multer file filter that validates both MIME type AND file extension.
 * Extension-only checks can be bypassed by renaming files; MIME type
 * validation reads the Content-Type header reported by the client.
 *
 * For maximum security, use the 'file-type' package to inspect magic bytes.
 */
const fileFilter = (req, file, cb) => {
  const allowedMimes = Array.from(ALLOWED_MIME_TYPES.keys());
  const allowedExtensions = Array.from(ALLOWED_MIME_TYPES.values()).flat();

  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype.toLowerCase();

  // Validate MIME type
  if (!allowedMimes.includes(mime)) {
    return cb(new BadRequestError(
      `Unsupported file type: ${mime}. Allowed types: ${allowedMimes.join(', ')}`
    ), false);
  }

  // Validate extension matches reported MIME type
  const allowedExtsForMime = ALLOWED_MIME_TYPES.get(mime) || [];
  if (!allowedExtsForMime.includes(ext)) {
    return cb(new BadRequestError(
      `File extension '${ext}' does not match the file type '${mime}'`
    ), false);
  }

  cb(null, true);
};

/**
 * Use memory storage — files are passed to Cloudinary instead of
 * being stored on the application server's filesystem.
 *
 * This fixes CRIT-07: user uploads were previously served via express.static,
 * creating a stored XSS vector. Files must be uploaded to a CDN/object store.
 */
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB maximum
    files: 1                    // Maximum 1 file per request
  },
  fileFilter
});

export default upload;
