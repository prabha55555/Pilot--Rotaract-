import { v2 as cloudinary } from 'cloudinary'
import dotenv from 'dotenv'

dotenv.config()

// If CLOUDINARY_URL is present, v2.config() automatically picks it up.
// Just to be safe, we configure it explicitly if environment variables are loaded.
if (process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloudinary_api_url: process.env.CLOUDINARY_URL
  })
}

/**
 * Uploads a buffer directly to Cloudinary as an auto resource (PDF).
 * @param {Buffer} buffer The PDF file buffer
 * @param {string} activityId The activity ID for naming
 * @returns {Promise<object>} Cloudinary upload result
 */
export const uploadBufferToCloudinary = (buffer, activityId) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'activity_reports',
        resource_type: 'auto',
        public_id: `activity_${activityId}_report`,
        format: 'pdf',
        overwrite: true
      },
      (error, result) => {
        if (error) {
          console.error('❌ Cloudinary Buffer Upload Error:', error)
          return reject(error)
        }
        resolve(result)
      }
    )
    uploadStream.end(buffer)
  })
}
