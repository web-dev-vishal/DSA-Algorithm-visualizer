import CloudinaryService from '../services/cloudinary.service.js';
import FileUpload from '../models/FileUpload.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { BadRequestError } from '../errors/ApiError.js';

export class FileController {
  // ── Upload Single File ─────────────────────────────────────────────
  static async uploadSingle(req, res, next) {
    try {
      if (!req.file) {
        throw new BadRequestError('No file provided');
      }

      // Upload to Cloudinary
      const cloudResult = await CloudinaryService.uploadFile(req.file.path, 'dsa_files');

      // Save document metadata
      const fileUpload = new FileUpload({
        originalName: req.file.originalname,
        fileName: req.file.filename,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url: cloudResult.url,
        publicId: cloudResult.publicId,
        ownerId: req.user._id
      });

      await fileUpload.save();

      return ApiResponse.success(res, fileUpload, 'File uploaded successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  // ── Upload Multiple Files ──────────────────────────────────────────
  static async uploadMultiple(req, res, next) {
    try {
      if (!req.files || req.files.length === 0) {
        throw new BadRequestError('No files provided');
      }

      const uploadedFiles = [];

      for (const file of req.files) {
        // Upload to Cloudinary
        const cloudResult = await CloudinaryService.uploadFile(file.path, 'dsa_files');

        // Save document metadata
        const fileUpload = new FileUpload({
          originalName: file.originalname,
          fileName: file.filename,
          mimeType: file.mimetype,
          size: file.size,
          url: cloudResult.url,
          publicId: cloudResult.publicId,
          ownerId: req.user._id
        });

        await fileUpload.save();
        uploadedFiles.push(fileUpload);
      }

      return ApiResponse.success(res, uploadedFiles, 'Files uploaded successfully', 201);
    } catch (err) {
      next(err);
    }
  }
}

export default FileController;
