import express from "express";
import UserController from "../controllers/user.controllers.js";
import verifyToken from "../middlewares/auth.js";

const userRouter = express.Router();


userRouter.get("/current", verifyToken, UserController.getCurrentUser);
userRouter.post("/register", UserController.registerUser);
userRouter.post("/login", UserController.loginUser);
userRouter.get("/", UserController.getAllUsers);
userRouter.get("/role/:role", UserController.getUsersByRole);
userRouter.get("/:id", UserController.getUserById);
userRouter.put("/:id", UserController.updateUser);
userRouter.delete("/:id", UserController.deleteUser);

export default userRouter;

