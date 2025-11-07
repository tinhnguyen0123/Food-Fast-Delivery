// ...existing code...
import express from "express";
import multer from "multer";
import ProductController from "../controllers/product.controllers.js";
import verifyToken from "../middlewares/auth.js";

const productRouter = express.Router();
const upload = multer({ dest: "uploads/" });

// Cho phép cả 'image' và 'file', rồi chuẩn hóa về req.file
const pickFirstFile = (req, _res, next) => {
  if (req.file) return next();
  const f = (req.files?.image?.[0]) || (req.files?.file?.[0]);
  if (f) req.file = f;
  next();
};

// CRUD routes
productRouter.post(
  "/",
  verifyToken,
  upload.fields([{ name: "image", maxCount: 1 }, { name: "file", maxCount: 1 }]),
  pickFirstFile,
  ProductController.create
);

productRouter.get("/restaurant/:restaurantId", ProductController.getByRestaurant);
productRouter.get("/category/:category", ProductController.getByCategory);
productRouter.get("/:id", ProductController.getById);
productRouter.post("/",verifyToken,upload.fields([{ name: "image", maxCount: 1 }, { name: "file", maxCount: 1 }]),pickFirstFile,ProductController.create);
productRouter.put("/:id", verifyToken,upload.fields([{ name: "image", maxCount: 1 }, { name: "file", maxCount: 1 }]),pickFirstFile,ProductController.update);

productRouter.delete("/:id", verifyToken, ProductController.delete);

export default productRouter;
// ...existing code...