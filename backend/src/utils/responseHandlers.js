/**
 * Standard response handlers for API endpoints
 */
const { logger } = require("./logger");

/**
 * Send a success response
 * @param {Object} res - Express response object
 * @param {any} data - Data to send in the response
 * @param {string} message - Optional success message
 * @param {number} status - HTTP status code (default: 200)
 */
const handleSuccess = (res, data, message = "Success", status = 200) => {
  return res.status(status).json({
    status: "success",
    message,
    data,
  });
};

/**
 * Send an error response
 * @param {Object} res - Express response object
 * @param {Error|Object} error - Error object or error data
 * @param {number} status - HTTP status code (default: 500)
 */
const handleError = (res, error, status = 500) => {
  // Get error message and details
  const errorMessage = error.message || "An unexpected error occurred";

  // Log the error
  logger.error(errorMessage, error);

  // Create response based on error type
  let responseData = {
    status: "error",
    message: errorMessage,
  };

  // Add validation errors if available
  if (error.errors) {
    responseData.errors = error.errors;
  }

  // Determine appropriate status code
  let statusCode = status;
  if (error.statusCode) {
    statusCode = error.statusCode;
  } else if (error.name === "ValidationError") {
    statusCode = 400;
  } else if (error.name === "UnauthorizedError") {
    statusCode = 401;
  } else if (error.name === "ForbiddenError") {
    statusCode = 403;
  } else if (error.name === "NotFoundError") {
    statusCode = 404;
  }

  return res.status(statusCode).json(responseData);
};

module.exports = {
  handleSuccess,
  handleError,
};
