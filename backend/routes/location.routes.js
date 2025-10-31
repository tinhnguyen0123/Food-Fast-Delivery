import express from "express";
import LocationController from "../controllers/location.controllers.js";

const locationRouter = express.Router();

// CRUD routes
locationRouter.post("/", LocationController.create);
locationRouter.get("/", LocationController.getAll);
locationRouter.get("/:id", LocationController.getById);
locationRouter.get("/type/:type", LocationController.getByType);
locationRouter.put("/:id", LocationController.update);
locationRouter.delete("/:id", LocationController.delete);

export default locationRouter;
