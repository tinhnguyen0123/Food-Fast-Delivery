import express from "express";
import PaymentController from "../controllers/payment.controllers.js";
import { verifyToken } from "../middlewares/auth.js";

const paymentRouter = express.Router();

// 🔹 MỚI: Route nhận IPN từ MoMo (Không cần verifyToken)
paymentRouter.post("/momo_ipn", PaymentController.handleMomoIPN);

// CRUD routes
paymentRouter.post("/", verifyToken, PaymentController.create);
paymentRouter.get("/:id", verifyToken, PaymentController.getById);
paymentRouter.get("/order/:orderId", verifyToken, PaymentController.getByOrder);
paymentRouter.get("/status/:status", verifyToken, PaymentController.getByStatus);
paymentRouter.put("/:id", verifyToken, PaymentController.update);
paymentRouter.delete("/:id", verifyToken, PaymentController.delete);

export default paymentRouter;
