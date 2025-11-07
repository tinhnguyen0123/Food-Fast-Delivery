// ...existing code...
import React, { useMemo } from "react";
import { NavLink, Outlet, Navigate, useNavigate } from "react-router-dom";
// ...existing code...

// ✅ Lấy base URL từ biến môi trường hoặc mặc định localhost
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function AdminDashboard() {
  const navigate = useNavigate();

  // ✅ Lấy thông tin user từ localStorage
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  // ✅ Nếu không phải admin → điều hướng về trang chủ
  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // ✅ Xử lý đăng xuất (gọi API + xóa localStorage)
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        credentials: "include",
      });
    } catch (e) {
      console.error("logout error:", e);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login", { replace: true });
    }
  };

  // ✅ Danh sách menu quản trị
  const items = [
    { to: "/admin/orders", label: "Management Orders" },
    { to: "/admin/users", label: "Management Users" },
    { to: "/admin/restaurants", label: "Management Restaurants" },
    { to: "/admin/drones", label: "Management Drones" },
    { to: "/admin/analytics", label: "Analytics" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* ✅ Header */}
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-600">Quản trị hệ thống</p>
          </div>

          {/* ✅ Nút về trang chủ + đăng xuất */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 text-sm"
            >
              Đăng xuất
            </button>
          </div>
        </header>

        {/* ✅ Giao diện chính */}
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <aside className="col-span-12 md:col-span-3 lg:col-span-2">
            <nav className="space-y-2 bg-white rounded-lg p-4 shadow">
              {items.map((it) => (
                <NavLink
                  key={it.to}
                  to={it.to}
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded text-sm font-medium ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`
                  }
                >
                  {it.label}
                </NavLink>
              ))}
            </nav>
          </aside>

          {/* Nội dung chính */}
          <main className="col-span-12 md:col-span-9 lg:col-span-10">
            <div className="space-y-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
// ...existing code...
