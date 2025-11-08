import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, requiredRole, allowedRoles }) {
  const token = localStorage.getItem("token");
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch (e) {
    user = null;
  }

  // 1. Nếu chưa login → chuyển về login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Nếu yêu cầu role cụ thể (requiredRole)
  if (requiredRole && user.role !== requiredRole) {
    // Chuyển về trang tương ứng với role hiện tại
    if (user.role === 'admin') {
      return <Navigate to="/admin/orders" replace />;
    } else if (user.role === 'restaurant') {
      return <Navigate to="/restaurant/dashboard" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  // 3. Nếu yêu cầu danh sách role (allowedRoles)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Chuyển về trang tương ứng với role hiện tại
    if (user.role === 'admin') {
      return <Navigate to="/admin/orders" replace />;
    } else if (user.role === 'restaurant') {
      return <Navigate to="/restaurant/dashboard" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}