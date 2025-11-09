// routes/restaurant.routes.js
import express from "express";
import multer from "multer";
import RestaurantController from "../controllers/restaurant.controllers.js";
import { verifyToken, ensureAdmin } from "../middlewares/auth.js"; 

const restaurantRouter = express.Router();
const upload = multer({ dest: "uploads/" });

// 🔹 Tạo nhà hàng (có upload ảnh)
restaurantRouter.post("/", verifyToken, upload.single("image"), RestaurantController.create);

// 🔹 Lấy tất cả nhà hàng
restaurantRouter.get("/", RestaurantController.getAll);

// 🔹 Lấy nhà hàng theo chủ sở hữu
restaurantRouter.get("/owner/:ownerId", verifyToken, RestaurantController.getByOwner);

// 🔹 Cập nhật trạng thái (admin)
restaurantRouter.put("/:id/status", verifyToken, ensureAdmin, RestaurantController.updateStatus);

// 🔹 Khóa / Mở khóa nhà hàng (admin)
restaurantRouter.put("/:id/lock", verifyToken, ensureAdmin, RestaurantController.lock);
restaurantRouter.put("/:id/unlock", verifyToken, ensureAdmin, RestaurantController.unlock);

// 🔹 Danh sách public (only verified) cho khách hàng
restaurantRouter.get("/public", RestaurantController.getPublic);

// 🔹 Lấy nhà hàng theo ID
restaurantRouter.get("/:id", RestaurantController.getById);

// 🔹 Cập nhật nhà hàng (có upload ảnh)
restaurantRouter.put("/:id", verifyToken, upload.single("image"), RestaurantController.update);

// 🔹 Xóa nhà hàng (admin)
restaurantRouter.delete("/:id", verifyToken, ensureAdmin, RestaurantController.delete);

export default restaurantRouter;
