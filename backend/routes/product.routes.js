import express from "express";
import multer from "multer";
import ProductController from "../controllers/product.controllers.js";
import verifyToken from "../middlewares/auth.js";

const productRouter = express.Router();
const upload = multer({ dest: "uploads/" });

// CRUD routes
productRouter.post("/", verifyToken, upload.single("image"), ProductController.create);
productRouter.get("/:id", ProductController.getById);
productRouter.get("/restaurant/:restaurantId", ProductController.getByRestaurant);
productRouter.get("/category/:category", ProductController.getByCategory);
productRouter.put("/:id", verifyToken, upload.single("image"), ProductController.update);
productRouter.delete("/:id", verifyToken, ProductController.delete);

export default productRouter;
