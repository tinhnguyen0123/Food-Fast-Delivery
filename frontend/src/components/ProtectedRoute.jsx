import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, requiredRole }) {
  const token = localStorage.getItem("token");
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch (e) {
    user = null;
  }

  // Nếu chưa login -> chuyển về login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Nếu yêu cầu role (ví dụ admin) mà user không thỏa -> về trang chủ
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}
// ...existing code...