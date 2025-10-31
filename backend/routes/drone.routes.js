import express from "express";
import DroneController from "../controllers/drone.controllers.js";

const droneRouter = express.Router();

// CRUD routes
droneRouter.post("/", DroneController.create);
droneRouter.get("/", DroneController.getAll);
droneRouter.get("/:id", DroneController.getById);
droneRouter.get("/status/:status", DroneController.getByStatus);
droneRouter.put("/:id", DroneController.update);
droneRouter.delete("/:id", DroneController.delete);

export default droneRouter;
