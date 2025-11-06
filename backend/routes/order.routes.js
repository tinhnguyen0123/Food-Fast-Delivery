// ...existing code...
import express from "express";
import OrderController from "../controllers/order.controllers.js";

const orderRouter = express.Router();

// CRUD routes
orderRouter.post("/", OrderController.create);

// ĐẶT CÁC ROUTE CỤ THỂ TRƯỚC

orderRouter.get("/user/:userId", OrderController.getByUser);
orderRouter.get("/restaurant/:restaurantId", OrderController.getByRestaurant);
orderRouter.get("/status/:status", OrderController.getByStatus);

// SAU CÙNG MỚI LÀ /:id
orderRouter.get("/:id", OrderController.getById);

orderRouter.put("/:id", OrderController.update);
orderRouter.delete("/:id", OrderController.delete);

export default orderRouter;
// ...existing code...