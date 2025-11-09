// middlewares/auth.js
import jwt from "jsonwebtoken";

// ✅ Middleware xác thực token
export const verifyToken = (req, res, next) => {
  try {
    let token = null;

    // 1️⃣ Lấy token từ header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    } 
    // 2️⃣ Nếu không có header, lấy từ cookie
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // 3️⃣ Nếu không có token
    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    // 4️⃣ Giải mã token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5️⃣ Gắn thông tin user vào req để controller dùng
    // ✅ Thêm luôn status nếu có trong payload
    req.user = {
      id: decoded.id,
      role: decoded.role,
      status: decoded.status || "active", // mặc định active nếu JWT chưa có
    };

    // 6️⃣ Chuyển sang controller
    next();
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

// ✅ Middleware kiểm tra quyền Admin
export const ensureAdmin = (req, res, next) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }
    next();
  } catch (e) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

// ✅ Middleware kiểm tra tài khoản chưa bị khóa
export const ensureNotSuspended = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  if (req.user.status === "suspended") {
    return res.status(403).json({ message: "Tài khoản đã bị khóa" });
  }
  next();
};
