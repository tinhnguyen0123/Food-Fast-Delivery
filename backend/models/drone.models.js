import mongoose from "mongoose";

const droneSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String }, 
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", required: true },
    status: {
      type: String,
      enum: ["idle", "delivering","returning  ", "charging", "maintenance"],
      default: "idle",
    },
    batteryLevel: { type: Number, default: 100, min: 0, max: 100 }, // ✅ pin (%)
    capacity: { type: Number, default: 5 }, // tải tối đa (kg)
    currentLoad: { type: Number, default: 0 }, // tải hiện tại
    currentLocationId: { type: mongoose.Schema.Types.ObjectId, ref: "Location" },
  },
  { timestamps: true }
);

export default mongoose.model("Drone", droneSchema);
