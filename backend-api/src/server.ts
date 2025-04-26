import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config/config";
import { logger } from "./utils/logger";
import { initializeApp } from "./config/firebase";
import { errorMiddleware } from "./middleware/error.middleware";
import { rateLimitMiddleware } from "./middleware/rateLimit.middleware";
import adminRouter from "./routes/admin.routes";

const morganStream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

export const startServer = () => {
  const app: Express = express();
  const PORT = config.port || 5000;

  // Initialize Firebase app
  initializeApp();

  // Middleware
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(rateLimitMiddleware);

  // Morgan HTTP logging
  app.use(
    morgan(":method :url :status :res[content-length] - :response-time ms :user-id", {
      stream: morganStream,
      skip: (req: Request, res: Response) => res.statusCode >= 400, // Log successful requests to info
    })
  );
  app.use(
    morgan(":method :url :status :res[content-length] - :response-time ms :user-id", {
      stream: morganStream,
      skip: (req: Request, res: Response) => res.statusCode < 400, // Log error requests to error
    })
  );

  // Custom Morgan token for user ID
  morgan.token("user-id", (req: Request) => {
    return (req as any).userId || "anonymous";
  });

  // Routes
  app.get("/health", (req: Request, res: Response) => {
    res.status(200).json({ status: "OK" });
  });

  // app.use("/api/services", serviceRoutes);
  // app.use("/api/orders", orderRoutes);
  app.use("/api/admin", adminRouter);

  app.use(errorMiddleware);

  app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
  });
};
