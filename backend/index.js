import express from "express";
import dotenv from "dotenv";
dotenv.config();
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import restaurantRouter from "./routes/restaurant.routes.js";
import productRouter from "./routes/product.routes.js";
import orderRouter from "./routes/order.routes.js";
import cartRouter from "./routes/cart.routes.js";
import roleRouter from "./routes/role.routes.js";
import paymentRouter from "./routes/payment.routes.js";
import deliveryRouter from "./routes/delivery.routes.js";
import droneRouter from "./routes/drone.routes.js";
import locationRouter from "./routes/location.routes.js";
import cors from "cors";

import DroneMovementService from "./services/droneMovement.services.js";


const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Cấu hình CORS động cho nhiều frontend (5173, 5174, 5175)
const FRONTEND_ORIGINS = (
  process.env.FRONTEND_ORIGINS ||
  "http://localhost:5173,http://localhost:5174,http://localhost:5175"
).split(",");

app.use(
  cors({
    origin: function (origin, callback) {
      // Cho phép các request không có origin (ví dụ: Postman, cURL)
      if (!origin) return callback(null, true);

      if (FRONTEND_ORIGINS.indexOf(origin) !== -1) {
        return callback(null, true);
      }

      console.warn(`❌ CORS blocked request from origin: ${origin}`);
      return callback(new Error("CORS policy: Origin not allowed"), false);
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// ✅ Các route API
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/restaurant", restaurantRouter);
app.use("/api/product", productRouter);
app.use("/api/order", orderRouter);
app.use("/api/cart", cartRouter);
app.use("/api/role", roleRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/delivery", deliveryRouter);
app.use("/api/drone", droneRouter);
app.use("/api/location", locationRouter);

// ✅ Route kiểm tra server
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Server is running fine!",
  });
});

process.on("SIGINT", () => {
  console.log("\n🛑 Stopping all drone movements...");
  DroneMovementService.stopAll();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n🛑 Stopping all drone movements...");
  DroneMovementService.stopAll();
  process.exit(0);
});


// ✅ Khởi động server
app.listen(PORT, () => {
  connectDB();
  console.log(`🚀 Server is running on port ${PORT}`);
});
