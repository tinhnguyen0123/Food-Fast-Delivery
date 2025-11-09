import express from "express";
import { verifyToken } from "../middlewares/auth.js";
import OrderController from "../controllers/order.controllers.js";

const orderRouter = express.Router();

// ✅ Tạo đơn hàng
orderRouter.post("/", OrderController.create);

// ✅ Lấy danh sách đơn hàng theo người dùng
orderRouter.get("/user/:userId", OrderController.getByUser);

// ✅ Lấy danh sách đơn hàng theo nhà hàng
orderRouter.get("/restaurant/:restaurantId", OrderController.getByRestaurant);

// ✅ Lấy danh sách đơn hàng theo trạng thái
orderRouter.get("/status/:status", OrderController.getByStatus);

// ✅ Khách hàng xác nhận đã nhận hàng (chuyển sang completed)
orderRouter.put("/:id/confirm-completed", verifyToken, OrderController.confirmCompleted);

// ✅ Lấy chi tiết đơn hàng theo ID
orderRouter.get("/:id", OrderController.getById);

// ✅ Cập nhật đơn hàng (được chặn nếu status = 'completed' mà không phải customer)
orderRouter.put("/:id", OrderController.update);

// ✅ Xóa đơn hàng
orderRouter.delete("/:id", OrderController.delete);

export default orderRouter;
