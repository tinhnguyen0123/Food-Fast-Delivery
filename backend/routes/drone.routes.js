import express from "express";
import DroneController from "../controllers/drone.controllers.js";
import { verifyToken } from "../middlewares/auth.js";

const droneRouter = express.Router();

// ✅ CRUD cơ bản
droneRouter.post("/", DroneController.create);
droneRouter.get("/restaurant/:restaurantId", verifyToken, DroneController.getByRestaurant);
droneRouter.get("/", DroneController.getAll);

// ✅ Các route đặc biệt trước /:id
droneRouter.get("/status/:status", DroneController.getByStatus);
droneRouter.post("/assign", DroneController.assign);
droneRouter.post("/auto-assign", DroneController.autoAssign);
droneRouter.post("/auto-assign/:restaurantId", DroneController.autoAssign);

// ✅ Bắt đầu giao (nhà hàng chủ động)
droneRouter.post("/start-delivery", DroneController.startDelivery);

// ✅ Các route theo :id sau cùng
droneRouter.get("/:id", DroneController.getById);
droneRouter.put("/:id", DroneController.update);
droneRouter.delete("/:id", DroneController.delete);

export default droneRouter;
