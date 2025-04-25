import admin from "firebase-admin";
const serviceAccount = "./tofapay-serviceAccount.json";

export const initializeApp = () => {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
};
