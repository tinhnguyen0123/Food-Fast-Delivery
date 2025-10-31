// routes/user.routes.js
import express from "express";
import UserController from "../controllers/user.controllers.js";
import verifyToken from "../middlewares/auth.js";

const userRouter = express.Router();

// Các route cho user
userRouter.get("/", verifyToken, UserController.getAllUsers);
userRouter.get("/:id", verifyToken, UserController.getUserById);
userRouter.get("/role/:role", verifyToken, UserController.getUsersByRole);
userRouter.put("/:id", verifyToken, UserController.updateUser);
userRouter.delete("/:id", verifyToken, UserController.deleteUser);

export default userRouter;
