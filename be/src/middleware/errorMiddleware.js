const ApiError = require("../utils/ApiError");

const errorHandler = (err, req, res, next) => {
    if (err instanceof ApiError) {
      return res.status(err.statusCode).json({
        success: false,
        message: err.message,
        error: err.error
      });
    }
  
    // Generic error handler for unexpected errors
    res.status(500).json({
      success: false,
      message: "An unexpected error occurred",
      error: err.message
    });
}

module.exports = {errorHandler};