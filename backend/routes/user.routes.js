import express from "express";
import UserController from "../controllers/user.controllers.js";
import verifyToken from "../middlewares/auth.js";

const userRouter = express.Router();

// 🔹 Lấy user hiện tại (dùng token)
userRouter.get("/current", verifyToken, UserController.getCurrentUser);

// 🔹 Đăng ký
userRouter.post("/register", UserController.registerUser);

// 🔹 Đăng nhập
userRouter.post("/login", UserController.loginUser);

// 🔹 Lấy tất cả user
userRouter.get("/", UserController.getAllUsers);

// 🔹 Lấy user theo role (phải trước /:id)
userRouter.get("/role/:role", UserController.getUsersByRole);

// 🔹 Lấy user theo ID
userRouter.get("/:id", UserController.getUserById);

// 🔹 Cập nhật user
userRouter.put("/:id", UserController.updateUser);

// 🔹 Xóa user
userRouter.delete("/:id", UserController.deleteUser);

export default userRouter;

