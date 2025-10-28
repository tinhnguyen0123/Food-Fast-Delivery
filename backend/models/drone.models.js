import mongoose from "mongoose";

const droneSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["idle", "delivering", "charging", "maintenance"],
      default: "idle",
    },
    batteryLevel: { type: Number, default: 100 },
    currentLocationId: { type: mongoose.Schema.Types.ObjectId, ref: "Location" },
  },
  { timestamps: true }
);

export default mongoose.model("Drone", droneSchema);
