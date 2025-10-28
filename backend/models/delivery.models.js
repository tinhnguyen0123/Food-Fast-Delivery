import mongoose from "mongoose";

const deliverySchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    droneId: { type: mongoose.Schema.Types.ObjectId, ref: "Drone" },
    pickupLocationId: { type: mongoose.Schema.Types.ObjectId, ref: "Location" },
    dropoffLocationId: { type: mongoose.Schema.Types.ObjectId, ref: "Location" },
    status: {
      type: String,
      enum: ["waiting", "on_the_way", "arrived", "completed"],
      default: "waiting",
    },
    startedAt: Date,
    completedAt: Date
  },
  { timestamps: true }
);

export default mongoose.model("Delivery", deliverySchema);
