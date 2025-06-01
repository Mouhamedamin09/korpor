/**
 * Cloudinary configuration for verification document uploads
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
 * Upload a buffer to Cloudinary
 * @param {Buffer} buffer - File buffer to upload
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result
 */
const uploadBuffer = async (buffer, options = {}) => {
  try {
    // If Cloudinary credentials are not set, log a warning and return a mock response
    if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.warn(
        "Cloudinary credentials not set. Using mock upload response."
      );
      //to ghassen(hethi taamel upload lel image lel Cloudinary cloud ama mock!!)
      return {
        secure_url: `https://placeholder.com/${
          options.public_id || "image"
        }.jpg`,
        public_id: options.public_id || "placeholder-id",
        ...options,
      };
    }

    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(options, (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        })
        .end(buffer);
    });
  } catch (error) {
    console.error("Error uploading buffer to Cloudinary:", error);
    throw error;
  }
};

module.exports = {
  ...cloudinary,
  uploadBuffer,
};
