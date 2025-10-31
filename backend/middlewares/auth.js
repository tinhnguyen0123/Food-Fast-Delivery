import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  try {
    // Lấy token từ cookie hoặc header
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

    if (!token)
      return res.status(401).json({ message: "Access denied. No token provided." });

    // Giải mã token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Gắn thông tin user vào request để các controller khác dùng
    req.user = decoded;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired. Please login again." });
    }
    return res.status(400).json({ message: "Invalid token." });
  }
};

export default verifyToken;
