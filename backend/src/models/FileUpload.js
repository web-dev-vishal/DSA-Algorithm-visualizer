import mongoose from 'mongoose';

const FileUploadSchema = new mongoose.Schema({
  originalName: {
    type: String,
    required: true,
    trim: true
  },
  fileName: {
    type: String,
    required: true,
    trim: true
  },
  mimeType: {
    type: String
  },
  size: {
    type: Number
  },
  url: {
    type: String,
    required: true
  },
  publicId: {
    type: String // Cloudinary asset ID
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

FileUploadSchema.index({ ownerId: 1 });

const FileUpload = mongoose.model('FileUpload', FileUploadSchema);
export default FileUpload;
