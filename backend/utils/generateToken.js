import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// Hàm tạo token
export const generateToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role, // ví dụ: admin, customer, restaurantOwner
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

  return token;
};

// (Tuỳ chọn) Hàm kiểm tra token hợp lệ
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};
