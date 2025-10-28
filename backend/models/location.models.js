import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["user", "restaurant", "drone"], required: true },
    coords: {
      lat: Number,
      lng: Number
    },
    address: String
  }
);

export default mongoose.model("Location", locationSchema);
