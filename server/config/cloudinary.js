import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const isCloudinaryConfigured = () => {
  if (process.env.USE_LOCAL_STORAGE === 'true') return false;
  return (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloudinary_cloud_name' &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_KEY !== 'your_cloudinary_api_key' &&
    process.env.CLOUDINARY_API_SECRET &&
    process.env.CLOUDINARY_API_SECRET !== 'your_cloudinary_api_secret'
  );
};

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('Cloudinary initialized successfully.');
} else {
  console.warn(
    'WARNING: Cloudinary credentials missing or placeholders used. Falling back to local file storage.'
  );
}

/**
 * Uploads a local file to Cloudinary (or fallback local directory)
 * @param {string} localFilePath - Path of the file on disk
 * @param {string} [resourceType='auto'] - Type of media: 'image', 'video', 'raw', or 'auto'
 * @returns {Promise<{ url: string, publicId: string }>} Upload details
 */
export const uploadOnCloudinary = async (localFilePath, resourceType = 'auto') => {
  if (!localFilePath || !fs.existsSync(localFilePath)) return null;

  const saveLocally = () => {
    try {
      const fileName = path.basename(localFilePath);
      const publicDir = path.join(process.cwd(), 'public', 'uploads');

      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }

      const destPath = path.join(publicDir, fileName);
      fs.copyFileSync(localFilePath, destPath);

      try {
        if (fs.existsSync(localFilePath)) {
          fs.unlinkSync(localFilePath);
        }
      } catch (err) {
        console.error('Error deleting temp file:', err.message);
      }

      return {
        url: `/uploads/${fileName}`,
        publicId: fileName,
        duration: 15,
      };
    } catch (localErr) {
      console.error('Local file save failed:', localErr);
      throw new Error(`Local file storage failed: ${localErr.message}`);
    }
  };

  if (isCloudinaryConfigured()) {
    try {
      console.log(`Uploading ${resourceType} to Cloudinary...`);
      const response = await cloudinary.uploader.upload(localFilePath, {
        resource_type: resourceType === 'video' ? 'video' : 'auto',
        folder: 'youtube_clone',
        timeout: 120000, // 2 minutes timeout for Cloudinary network request
      });

      try {
        if (fs.existsSync(localFilePath)) {
          fs.unlinkSync(localFilePath);
        }
      } catch (err) {
        console.error('Error deleting local file after Cloudinary upload:', err.message);
      }

      console.log(`Cloudinary upload successful: ${response.secure_url}`);
      return {
        url: response.secure_url,
        publicId: response.public_id,
        duration: response.duration,
      };
    } catch (cloudinaryErr) {
      console.error('Cloudinary API error:', cloudinaryErr.message);
      if (process.env.NODE_ENV === 'development') {
        console.warn('Falling back to local file storage for development...');
        return saveLocally();
      }
      throw new Error(`Cloudinary upload failed: ${cloudinaryErr.message}`);
    }
  }

  return saveLocally();
};

/**
 * Deletes a file from Cloudinary (or local fallback)
 * @param {string} publicId - Cloudinary public id or file name
 * @param {string} [resourceType='image'] - 'image' or 'video'
 * @returns {Promise<any>} Response
 */
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    if (!publicId) return null;

    if (isCloudinaryConfigured()) {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
      });
      return result;
    } else {
      // Local fallback deletion
      const filePath = path.join(process.cwd(), 'public', 'uploads', publicId);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return { result: 'ok' };
    }
  } catch (error) {
    console.error('Cloudinary deletion error:', error);
    return null;
  }
};
