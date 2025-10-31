import express from "express";
import multer from "multer";
import RestaurantController from "../controllers/restaurant.controllers.js";
import verifyToken from "../middlewares/auth.js"; // nếu cần giới hạn quyền truy cập

const restaurantRouter = express.Router();


const upload = multer({ dest: "uploads/" });


restaurantRouter.post("/", verifyToken, upload.single("image"), RestaurantController.create);
restaurantRouter.get("/", RestaurantController.getAll);
restaurantRouter.get("/:id", RestaurantController.getById);
restaurantRouter.get("/owner/:ownerId", verifyToken, RestaurantController.getByOwner);
restaurantRouter.put("/:id", verifyToken, upload.single("image"), RestaurantController.update);
restaurantRouter.delete("/:id", verifyToken, RestaurantController.delete);

export default restaurantRouter;
