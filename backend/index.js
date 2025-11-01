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
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());
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

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Server is running fine!",
  });
});


app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port ${PORT}`);
});
