import admin from "firebase-admin";
import { logger } from "../utils/logger";
import { User } from "../types";

class UserService {
  async getAllUsers(): Promise<User[]> {
    try {
      const snapshot = await admin.firestore().collection("users").get();
      const users: User[] = [];
      snapshot.docs.map((doc) => {
        users.push({ id: doc.id, ...doc.data() } as User);
      });
      return users;
    } catch (error) {
      console.log("Error fetching users from Firestore", error);
      logger.error("Error fetching users from Firestore", { error });
      throw error;
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    try {
      const userDoc = await admin.firestore().collection("users").doc(userId).get();
      if (!userDoc.exists) {
        return null;
      }
      return { id: userDoc.id, ...userDoc.data() } as User;
    } catch (error) {
      logger.error("Error fetching user from Firestore", { error, userId });
      throw error;
    }
  }

  async upsertUser(user: User): Promise<void> {
    try {
      await admin.firestore().collection("users").doc(user.id).set(user, { merge: true });
    } catch (error) {
      logger.error("Error upserting user in Firestore", { error, userId: user.id });
      throw error;
    }
  }
}
const userService = new UserService();
export default userService;
