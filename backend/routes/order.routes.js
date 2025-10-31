import express from "express";
import OrderController from "../controllers/order.controllers.js";

const orderRouter = express.Router();

// CRUD routes
orderRouter.post("/", OrderController.create);
orderRouter.get("/:id", OrderController.getById);
orderRouter.get("/user/:userId", OrderController.getByUser);
orderRouter.get("/restaurant/:restaurantId", OrderController.getByRestaurant);
orderRouter.get("/status/:status", OrderController.getByStatus);
orderRouter.put("/:id", OrderController.update);
orderRouter.delete("/:id", OrderController.delete);

export default orderRouter;
    