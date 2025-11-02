import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, requiredRole }) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  // Chưa đăng nhập
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  // Kiểm tra role nếu cần
  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-red-600">Không có quyền truy cập</h2>
        <p className="text-gray-600 mt-2">Bạn không có quyền truy cập trang này.</p>
      </div>
    );
  }
  
  return children;
}