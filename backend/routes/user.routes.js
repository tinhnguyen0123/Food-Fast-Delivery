// routes/user.routes.js
import express from "express";
import UserController from "../controllers/user.controllers.js";
import verifyToken from "../middlewares/auth.js"; // middleware xác thực token

const userRouter = express.Router();

// 🔹 Lấy tất cả user
userRouter.get("/", UserController.getAllUsers);

// 🔹 Lấy user hiện tại (dùng token)
userRouter.get("/current", verifyToken, UserController.getCurrentUser);

// 🔹 Lấy user theo ID
userRouter.get("/:id", UserController.getUserById);

// 🔹 Lấy user theo role
userRouter.get("/role/:role", UserController.getUsersByRole);

// 🔹 Cập nhật user
userRouter.put("/:id", UserController.updateUser);

// 🔹 Xóa user
userRouter.delete("/:id", UserController.deleteUser);

// 🔹 Lấy user hiện tại (dùng token)
userRouter.get("/current", verifyToken, UserController.getCurrentUser);

export default userRouter;
