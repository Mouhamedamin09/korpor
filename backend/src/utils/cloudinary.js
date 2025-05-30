/**
 * Cloudinary configuration for image and document uploads
 */
require("dotenv").config();
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "demo",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
  secure: true,
});

/**
 * Upload a file to Cloudinary
 * @param {string} file - File to upload (can be a URL, base64, or file path)
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result
 */
const uploadFile = async (file, options = {}) => {
  try {
    // If Cloudinary credentials are not set, log a warning and return a mock response
    if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.warn(
        "Cloudinary credentials not set. Using mock upload response.",
      );
      return {
        secure_url: "https://placeholder.com/image.jpg",
        public_id: "placeholder-id",
        ...options,
      };
    }

    return await cloudinary.uploader.upload(file, options);
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
};

/**
 * Delete a file from Cloudinary
 * @param {string} publicId - Public ID of the file to delete
 * @param {Object} options - Delete options
 * @returns {Promise<Object>} Delete result
 */
const deleteFile = async (publicId, options = {}) => {
  try {
    // If Cloudinary credentials are not set, log a warning and return a mock response
    if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.warn(
        "Cloudinary credentials not set. Using mock delete response.",
      );
      return { result: "ok" };
    }

    return await cloudinary.uploader.destroy(publicId, options);
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw error;
  }
};

module.exports = {
  ...cloudinary,
  uploadFile,
  deleteFile,
};
