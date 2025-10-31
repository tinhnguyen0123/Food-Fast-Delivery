import express from "express";
import DeliveryController from "../controllers/delivery.controllers.js";

const deliveryRouter = express.Router();

// CRUD routes
deliveryRouter.post("/", DeliveryController.create);
deliveryRouter.get("/:id", DeliveryController.getById);
deliveryRouter.get("/drone/:droneId", DeliveryController.getByDrone);
deliveryRouter.get("/order/:orderId", DeliveryController.getByOrder);
deliveryRouter.put("/:id", DeliveryController.update);
deliveryRouter.delete("/:id", DeliveryController.delete);

export default deliveryRouter;
