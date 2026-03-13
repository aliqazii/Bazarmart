import ErrorHandler from "../utils/errorHandler.js";

const errorMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  // MongoDB bad ObjectId
  if (err.name === "CastError") {
    err = new ErrorHandler(`Resource not found. Invalid: ${err.path}`, 400);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    err = new ErrorHandler(
      `Duplicate ${Object.keys(err.keyValue)} entered`,
      400
    );
  }

  // JWT error
  if (err.name === "JsonWebTokenError") {
    err = new ErrorHandler("Invalid token, please login again", 401);
  }

  // JWT expired
  if (err.name === "TokenExpiredError") {
    err = new ErrorHandler("Token expired, please login again", 401);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};

export default errorMiddleware;