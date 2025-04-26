import { Router } from "express";
import * as adminController from "../controllers/admin.controller";

const adminRouter = Router();

// User routes
adminRouter.get("/users/:userId", adminController.getUserById);
adminRouter.get("/users", adminController.getAllUsers);

// Service routes
adminRouter.post("/services", adminController.addService);
adminRouter.get("/services", adminController.getAllServices);

export default adminRouter;
