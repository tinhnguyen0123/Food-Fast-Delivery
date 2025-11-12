// routes/user.routes.js
import express from "express";
import UserController from "../controllers/user.controllers.js";
import { verifyToken, ensureAdmin } from "../middlewares/auth.js"; // ✅ import gộp hợp lý

const userRouter = express.Router();

// 🔹 Lấy user hiện tại từ token
userRouter.get("/current", verifyToken, UserController.getCurrentUser);

// 🔹 Đăng ký & Đăng nhập
userRouter.post("/register", UserController.registerUser);
userRouter.post("/login", UserController.loginUser);

// 🔹 Quản lý user (admin)
userRouter.get("/", verifyToken, ensureAdmin, UserController.getAllUsers);
userRouter.get("/role/:role", verifyToken, ensureAdmin, UserController.getUsersByRole);

// 🔹 Cập nhật user
userRouter.put("/:id/status", verifyToken, ensureAdmin, UserController.updateStatus);
userRouter.put("/:id", verifyToken, UserController.updateUser);

// 🔹 Khóa / Mở khóa user
userRouter.put("/:id/lock", verifyToken, ensureAdmin, UserController.lockUser);
userRouter.put("/:id/unlock", verifyToken, ensureAdmin, UserController.unlockUser);

// 🔹 Lấy user theo ID
userRouter.get("/:id", verifyToken, UserController.getUserById);

// 🔹 Xóa user
userRouter.delete("/:id", verifyToken, ensureAdmin, UserController.deleteUser);

export default userRouter;