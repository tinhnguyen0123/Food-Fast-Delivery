import express from "express";
import RoleController from "../controllers/role.controllers.js";

const roleRouter = express.Router();

roleRouter.post("/", RoleController.create);
roleRouter.get("/", RoleController.getAll);
roleRouter.get("/:id", RoleController.getById);
roleRouter.put("/:id", RoleController.update);
roleRouter.delete("/:id", RoleController.delete);

export default roleRouter;
