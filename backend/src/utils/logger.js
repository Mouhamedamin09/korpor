/**
 * Centralized logger for application-wide use
 */
const logger = {
  /**
   * Log an info message
   * @param {string} message - The message to log
   * @param {any} data - Optional additional data
   */
  info: (message, data) => {
    if (data) {
      console.log(`[INFO] ${message}`, data);
    } else {
      console.log(`[INFO] ${message}`);
    }
  },

  /**
   * Log a warning message
   * @param {string} message - The message to log
   * @param {any} data - Optional additional data
   */
  warn: (message, data) => {
    if (data) {
      console.warn(`[WARN] ${message}`, data);
    } else {
      console.warn(`[WARN] ${message}`);
    }
  },

  /**
   * Log an error message
   * @param {string} message - The message to log
   * @param {Error|any} error - The error object or additional data
   */
  error: (message, error) => {
    if (error instanceof Error) {
      console.error(`[ERROR] ${message}`, {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    } else if (error) {
      console.error(`[ERROR] ${message}`, error);
    } else {
      console.error(`[ERROR] ${message}`);
    }
  },

  /**
   * Log a debug message (only in development)
   * @param {string} message - The message to log
   * @param {any} data - Optional additional data
   */
  debug: (message, data) => {
    if (process.env.NODE_ENV !== "production") {
      if (data) {
        console.debug(`[DEBUG] ${message}`, data);
      } else {
        console.debug(`[DEBUG] ${message}`);
      }
    }
  },
};

module.exports = {
  logger,
};
