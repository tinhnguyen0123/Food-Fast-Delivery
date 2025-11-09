import express from "express";
import CartController from "../controllers/cart.controllers.js";
import { verifyToken } from "../middlewares/auth.js";

const cartRouter = express.Router();

cartRouter.post("/", verifyToken, CartController.createCart);
cartRouter.get("/latest", verifyToken, CartController.getLatestCart);
cartRouter.get("/:id", verifyToken, CartController.getById);
cartRouter.post("/add", verifyToken, CartController.addItem);
cartRouter.post("/remove", verifyToken, CartController.removeItem);
cartRouter.delete("/:id", verifyToken, CartController.deleteCart);

export default cartRouter;
