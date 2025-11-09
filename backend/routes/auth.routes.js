import express from "express";
import AuthController from "../controllers/auth.controllers.js";
import { verifyToken } from "../middlewares/auth.js";

const authRouter = express.Router();

// Đăng ký
authRouter.post("/register", AuthController.register);

// Đăng nhập
authRouter.post("/login", AuthController.login);

// Đăng xuất
authRouter.post("/logout", AuthController.logout);

// Đổi mật khẩu (cần đăng nhập)
authRouter.put("/change-password", verifyToken, AuthController.changePassword);

export default authRouter;
