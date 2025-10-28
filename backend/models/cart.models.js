import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          min: 1
        }
      }
    ],
    totalPrice: {
      type: Number,
      default: 0 // sẽ được cập nhật mỗi khi cart thay đổi
    },
  },
  { timestamps: true }
);

export default mongoose.model("Cart", cartSchema);
