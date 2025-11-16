import mongoose from "mongoose";

// 🔹 Schema cho từng item trong đơn hàng, lưu snapshot giá & tên
const OrderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1 },
    priceAtOrderTime: { type: Number, required: true, min: 0 }, // giá tại thời điểm đặt
    name: { type: String }, // snapshot tên sản phẩm, tuỳ chọn
  },
  { _id: false }
);

// Schema chính cho Order
const OrderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", required: true },
    items: { type: [OrderItemSchema], default: [] },
    status: {
      type: String,
      enum: ["pending", "preparing", "delivering", "completed", "cancelled"],
      default: "pending",
    },
    totalPrice: { type: Number, required: true, min: 0 },
    shippingAddress: {
      text: { type: String },
      location: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    paymentMethod: { type: String, enum: ["COD", "MOMO"], default: "COD" },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
    deliveryId: { type: mongoose.Schema.Types.ObjectId, ref: "Delivery" },
    arrivedNotified: { type: Boolean, default: false }, // ✅ Flag để frontend biết drone đã tới
    note: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("Order", OrderSchema);
