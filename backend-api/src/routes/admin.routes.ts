import { Router } from "express";
import * as adminController from "../controllers/admin.controller";

const adminRouter = Router();

adminRouter.get("/users", adminController.getAllUsers);

export default adminRouter;
