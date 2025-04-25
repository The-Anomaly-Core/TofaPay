import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "./config/config";
import { logger } from "./utils/logger";
import { initializeApp } from "./config/firebase";
import { errorMiddleware } from "./middleware/error.middleware";
import { rateLimitMiddleware } from "./middleware/rateLimit.middleware";
import adminRouter from "./routes/admin.routes";

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

  // Routes
  app.get("/health", (req: Request, res: Response) => {
    res.status(200).json({ status: "OK" });
  });

  // app.use("/api/services", serviceRoutes);
  // app.use("/api/orders", orderRoutes);
  app.use("/api", adminRouter);

  app.use(errorMiddleware);

  app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
  });
};
