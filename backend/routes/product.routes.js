import express from "express";
import multer from "multer";
import ProductController from "../controllers/product.controllers.js";
import { verifyToken } from "../middlewares/auth.js";

const productRouter = express.Router();
const upload = multer({ dest: "uploads/" });

// Chuẩn hóa file upload
const pickFirstFile = (req, _res, next) => {
  if (req.file) return next();
  const f = (req.files?.image?.[0]) || (req.files?.file?.[0]);
  if (f) req.file = f;
  next();
};

// 🏷️ Danh mục distinct (đặt trước /category/:category để tránh conflict)
productRouter.get("/categories", ProductController.getCategories);
productRouter.get("/restaurant/:restaurantId/categories", ProductController.getCategoriesByRestaurant);

// 🔍 Lấy sản phẩm
productRouter.get(
  "/my-restaurant/:restaurantId",
  verifyToken, // <-- Yêu cầu xác thực
  ProductController.getMyRestaurantProducts
); // dành cho chủ nhà hàng
productRouter.get("/:id", ProductController.getById);
productRouter.get("/restaurant/:restaurantId", ProductController.getByRestaurant);
productRouter.get("/category/:category", ProductController.getByCategory);

// 🟢 CRUD với upload (bảo vệ bằng verifyToken)
productRouter.post(
  "/",
  verifyToken,
  upload.fields([{ name: "image", maxCount: 1 }, { name: "file", maxCount: 1 }]),
  pickFirstFile,
  ProductController.create
);

productRouter.put(
  "/:id",
  verifyToken,
  upload.fields([{ name: "image", maxCount: 1 }, { name: "file", maxCount: 1 }]),
  pickFirstFile,
  ProductController.update
);

productRouter.delete("/:id", verifyToken, ProductController.delete);

export default productRouter;
