import { createHash } from 'node:crypto';

// Imported only by the server route. The API secret never leaves this module.
export function createCloudinaryUploadSignature() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_APP_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY || process.env.VITE_APP_CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET || process.env.VITE_APP_CLOUDINARY_API_SECRET;
  if (!cloudName || !/^[a-zA-Z0-9_-]+$/.test(cloudName) || !apiKey || !apiSecret) {
    throw new Error('Image uploads are not configured. Please contact the site administrator.');
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = createHash('sha1').update(`timestamp=${timestamp}${apiSecret}`).digest('hex');
  return { cloudName, apiKey, timestamp, signature };
}
