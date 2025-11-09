import mongoose from "mongoose";

const CATEGORY_ENUM = [
  "Món chính",
  "Món ăn vặt",
  "Món ăn sáng",
  "Món tráng miệng",
  "Thức uống"
];

const productSchema = new mongoose.Schema(
  {
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", required: true },
    name: { type: String, required: true },
      description: String,
    price: { type: Number, required: true },
      image: String,
    available: {  // ✅ THÊM FIELD NÀY
      type: Boolean, 
      default: true  // Default true: món mới luôn "Đang bán"
    },
  category: { type: String, enum: CATEGORY_ENUM, default: "Món chính" },  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
