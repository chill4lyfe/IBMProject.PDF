const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  if (err.name === "CastError") {
    statusCode = 400;
    message = `Resource not found. Invalid: ${err.path}`;
  }
  if (err.code === 11000) {
    statusCode = 400;
    message = `Duplicate field value entered: ${Object.keys(err.keyValue)} already exists.`;
  }
  // Ensure consistent JSON structure matching ApiResponse
  res.status(statusCode).json({
    statusCode,
    data: null,
    message,
    success: false,
  });
};

export { errorHandler };