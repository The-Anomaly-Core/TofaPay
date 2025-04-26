import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";

export class HttpError extends Error {
  public readonly statusCode: number;
  public readonly details?: any;

  constructor(message: string, statusCode: number, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

export const errorMiddleware = (error: Error, req: Request, res: Response, next: NextFunction) => {
  let httpError: HttpError;

  // Handle HttpError
  if (error instanceof HttpError) {
    httpError = error;
  } else if (error.name === "ValidationError") {
    httpError = new HttpError(error.message, 400);
  } else {
    httpError = new HttpError(error.message || "Internal server error", 500);
  }

  logger.error("Request failed", {
    error: {
      message: httpError.message,
      details: httpError.details,
      stack: process.env.NODE_ENV !== "production" ? error.stack : undefined,
    },
    ip: req.ip,
    userAgent: req.headers["user-agent"],
    path: req.path,
    method: req.method,
    userId: (req as any).userId || "anonymous",
  });

  // Send response
  res.status(httpError.statusCode).json({
    success: false,
    error: {
      message: httpError.message,
      details: process.env.NODE_ENV !== "production" ? httpError.details : undefined,
    },
  });
};
