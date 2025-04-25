import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const EnvSchema = z.object({
  PORT: z.string().default("5000"),
  NODE_ENV: z.enum(["dev", "production"]).default("dev"),
  API_KEY: z.string(),
  AUTH_DOMAIN: z.string(),
  PROJECT_ID: z.string(),
  STORAGE_BUCKET: z.string(),
  MESSAGING_SENDER_ID: z.string(),
  APP_ID: z.string(),
});

const env = EnvSchema.parse(process.env);

export const config = {
  port: env.PORT,

  firebaseConfig: {
    apiKey: env.API_KEY,
    authDomain: env.AUTH_DOMAIN,
    projectId: env.PROJECT_ID,
    storageBucket: env.STORAGE_BUCKET,
    messagingSenderId: env.MESSAGING_SENDER_ID,
    appId: env.APP_ID,
  },
};
