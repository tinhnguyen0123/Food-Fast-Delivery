import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    phone: String,
    address: String,
    locationId: { type: mongoose.Schema.Types.ObjectId, ref: "Location" },
    image: String,
    status: { type: String, enum: ["pending", "verified", "suspended"], default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.model("Restaurant", restaurantSchema);
