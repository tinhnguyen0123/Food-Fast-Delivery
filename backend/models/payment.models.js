// payment.models.js
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    // 🔹 THAY ĐỔI: Từ orderId sang orderIds
    orderIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true,
      },
    ],
    // 🔹 MỚI: Thêm trường amount để lưu tổng số tiền
    amount: {
      type: Number,
      required: true,
    },
    method: {
      type: String,
      enum: ["COD", "MOMO"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    transactionId: { type: String }, // Lưu MoMo transactionId
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);