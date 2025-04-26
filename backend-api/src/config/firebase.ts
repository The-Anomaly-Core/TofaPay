import admin from "firebase-admin";
import fs from "fs";
import { logger } from "../utils/logger";
import { HttpError } from "../middleware/error.middleware";

const serviceAccount = JSON.parse(fs.readFileSync("./serviceAccount.json", "utf8"));

export const initializeApp = () => {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });

    admin
      .firestore()
      .listCollections()
      .then(() => {
        logger.info("Firebase initialized successfully");
      })
      .catch((error) => {
        logger.error("Failed to connect to Firestore", { error });
        throw new HttpError("Failed to connect to Firestore", 500);
      });
  } catch (error) {
    logger.error("Firebase initialization failed", { error });
    throw error instanceof HttpError ? error : new HttpError("Failed to initialize Firebase", 500);
  }
};
