/**
 * Middleware for handling file uploads
 */
const multer = require("multer");
const { logger } = require("../utils/logger");

// Configure in-memory storage
const storage = multer.memoryStorage();

// File filter to validate uploads
const fileFilter = (req, file, cb) => {
  // Set allowed file types based on field name
  const allowedImageTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp",
    "image/gif",
  ];
  const allowedDocumentTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
    "application/json",
  ];

  // Check if file type is allowed based on the field name
  if (
    file.fieldname.startsWith("image") &&
    allowedImageTypes.includes(file.mimetype)
  ) {
    // Image upload is valid
    cb(null, true);
  } else if (
    file.fieldname.startsWith("document") &&
    [...allowedImageTypes, ...allowedDocumentTypes].includes(file.mimetype)
  ) {
    // Document upload is valid (documents can also be images)
    cb(null, true);
  } else {
    // Invalid file type
    logger.warn(
      `Rejected file upload: ${file.originalname} (${file.mimetype})`,
    );
    cb(new Error(`Invalid file type: ${file.mimetype}`), false);
  }
};

// Configure multer with limits
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
    files: 15, // Max number of files
  },
});

// Handle multer errors
const handleMulterErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    let message = "File upload error";

    // Customize the error message based on the error code
    if (err.code === "LIMIT_FILE_SIZE") {
      message = "File is too large. Max size is 10MB.";
    } else if (err.code === "LIMIT_FILE_COUNT") {
      message = "Too many files uploaded. Maximum is 15 files.";
    } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
      message = `Unexpected field: ${err.field}`;
    }

    logger.error(message, err);
    return res.status(400).json({
      status: "error",
      message,
    });
  }

  if (err) {
    logger.error("Upload error", err);
    return res.status(400).json({
      status: "error",
      message: err.message || "Error processing upload",
    });
  }

  next();
};

module.exports = upload;
