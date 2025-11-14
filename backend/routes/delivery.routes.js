import express from "express";
import DeliveryController from "../controllers/delivery.controllers.js";

const deliveryRouter = express.Router();

// 🔀 Đặt các route cụ thể lên trước "/:id"
deliveryRouter.post("/", DeliveryController.create);
deliveryRouter.get("/order/:orderId", DeliveryController.getByOrder);
deliveryRouter.get("/drone/:droneId", DeliveryController.getByDrone);
deliveryRouter.get("/:id", DeliveryController.getById);
deliveryRouter.put("/:id", DeliveryController.update);
deliveryRouter.delete("/:id", DeliveryController.delete);

export default deliveryRouter;