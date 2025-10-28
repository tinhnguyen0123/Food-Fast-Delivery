import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // hashed
    phone: { type: String },
    role: { type: String, enum: ["customer", "admin", "restaurant"], default: "customer" },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
