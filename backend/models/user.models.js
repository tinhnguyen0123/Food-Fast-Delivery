import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, 
    phone: { type: String, },
    role: { type: String, enum: ["customer", "admin", "restaurant"], default: "customer" },
  status: { type: String, enum: ["pending", "active", "suspended"], default: "active" },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
