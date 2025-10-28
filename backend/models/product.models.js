import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", required: true },
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    image: String,
    category: { type: String, default: "food" },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
