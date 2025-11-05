import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", required: true },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: Number,
        priceAtOrderTime: Number,
      },
    ],
    status: {
      type: String,
      enum: ["pending", "preparing", "delivering", "completed", "cancelled"],
      default: "pending",
    },
    totalPrice: Number,
    paymentMethod: { type: String, enum: ["COD", "VNPAY"] },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
    deliveryId: { type: mongoose.Schema.Types.ObjectId, ref: "Delivery" },

    // ✅ Thêm địa chỉ giao hàng
    shippingAddress: {
      text: String,
      location: {
        lat: Number,
        lng: Number,
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
