import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    method: {
      type: String,
      // 🔹 THAY ĐỔI: Thêm MOMO và bỏ VNPAY
      enum: ["COD", "MOMO"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    // 🔹 MỚI: Lưu MoMo transactionId để đối soát
    transactionId: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);