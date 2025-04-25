import { ErrorRequestHandler } from "express";
import { logger } from "../utils/logger";

export class HttpError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const errorMiddleware: ErrorRequestHandler = (error, req, res, next) => {
  console.log("Error handler called", error);
  logger.error("API Error", {
    message: error.message,
    stack: error.stack,
    statusCode: error.statusCode || 500,
    request: {
      path: req.path,
      method: req.method,
    },
  });

  if (error instanceof HttpError) {
    res.status(error.statusCode).json({
      status: "error",
      message: error.message,
    });
    return;
  }

  res.status(500).json({
    status: "error",
    message: error.message,
  });
};
