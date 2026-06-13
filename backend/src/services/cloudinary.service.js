import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import config from '../config/index.js';
import logger from '../utils/logger.js';

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret
});

export class CloudinaryService {
  /**
   * Uploads a local file to Cloudinary and cleans up the local copy.
   * @param {string} localFilePath 
   * @param {string} folder 
   * @returns {Promise<{ url: string, publicId: string }>}
   */
  static async uploadFile(localFilePath, folder = 'dsa_visualizer') {
    try {
      if (!config.cloudinary.cloudName || !config.cloudinary.apiKey || !config.cloudinary.apiSecret) {
        logger.warn('Cloudinary credentials not configured. Simulating file upload.');
        // In local/mock mode, we keep the file in local upload directory or simulate.
        // For simulation, we return a mock URL. If it's a real server, we could serve the uploads folder statically.
        const fileName = path.basename(localFilePath);
        return {
          url: `${config.clientUrl}/uploads/${fileName}`,
          publicId: `mock_public_id_${Date.now()}`
        };
      }

      const result = await cloudinary.uploader.upload(localFilePath, {
        folder,
        resource_type: 'auto'
      });

      // Cleanup local temp file
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }

      return {
        url: result.secure_url,
        publicId: result.public_id
      };
    } catch (err) {
      // Cleanup local temp file on error
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }
      logger.error('Cloudinary upload error:', err);
      throw new Error(`Cloudinary upload failed: ${err.message}`);
    }
  }

  /**
   * Destroys an asset on Cloudinary.
   * @param {string} publicId 
   * @returns {Promise<void>}
   */
  static async deleteFile(publicId) {
    try {
      if (!publicId || publicId.startsWith('mock_public_id_')) {
        return;
      }
      await cloudinary.uploader.destroy(publicId);
    } catch (err) {
      logger.error('Cloudinary delete error:', err);
      throw new Error(`Cloudinary asset deletion failed: ${err.message}`);
    }
  }
}

export default CloudinaryService;
