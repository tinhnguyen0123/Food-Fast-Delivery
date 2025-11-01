// middlewares/auth.js
import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
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
    req.user = { id: decoded.id, role: decoded.role };

    // 6️⃣ Chuyển sang controller
    return next();
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

export default verifyToken;
