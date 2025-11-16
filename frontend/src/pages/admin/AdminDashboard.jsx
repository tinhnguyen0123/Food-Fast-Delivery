import React, { useMemo, useState } from "react";
import { NavLink, Outlet, Navigate, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Store,
  Plane,
  BarChart3,
  LogOut,
  Menu,
  X,
  Shield,
  ChevronRight,
} from "lucide-react";

// ✅ Lấy base URL từ biến môi trường hoặc mặc định localhost
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  // ✅ Danh sách menu quản trị (Đã BỎ CÁC THUỘC TÍNH MÀU SẮC)
  const menuItems = [
    {
      to: "/admin/orders",
      label: "Quản lý Đơn hàng",
      icon: ShoppingCart,
    },
    {
      to: "/admin/users",
      label: "Quản lý Người dùng",
      icon: Users,
    },
    {
      to: "/admin/restaurants",
      label: "Quản lý Nhà hàng",
      icon: Store,
    },
    {
      to: "/admin/drones",
      label: "Quản lý Drone",
      icon: Plane,
    },
    {
      to: "/admin/analytics",
      label: "Thống kê & Báo cáo",
      icon: BarChart3,
    },
  ];

  return (
    // 1. ĐỔI NỀN SANG XÁM NHẠT
    <div className="min-h-screen bg-gray-100">
      {/* ✅ Header / Top Bar */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Title */}
            <div className="flex items-center gap-4">
              {/* 2. ĐỔI LOGO SANG MÀU ĐẶC */}
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                {/* 3. ĐỔI TIÊU ĐỀ SANG CHỮ ĐẶC */}
                <h1 className="text-xl font-bold text-gray-900">
                  Admin Dashboard
                </h1>
                <p className="text-xs text-gray-500">
                  Quản trị hệ thống • {user?.name || user?.email}
                </p>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={handleLogout}
                // 4. ĐỔI NÚT LOGOUT SANG MÀU NHẸ NHÀNG HƠN
                className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-all"
              >
                <LogOut className="w-4 h-4" />
                Đăng xuất
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <nav className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setIsMobileMenuOpen(false)}
                      // 4. CHUẨN HÓA MÀU SẮC MENU MOBILE
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                          isActive
                            ? `bg-blue-600 text-white shadow-md` // Active
                            : `text-gray-600 hover:bg-gray-100` // Inactive
                        }`
                      }
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    </NavLink>
                  );
                })}
              </nav>

              <button
                onClick={handleLogout}
                // 4. CHUẨN HÓA NÚT LOGOUT MOBILE
                className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ✅ Main Content */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* ✅ Sidebar - Desktop Only */}
          <aside className="hidden md:block md:col-span-3 lg:col-span-2">
            {/* 5. TINH CHỈNH BO GÓC (rounded-xl) VÀ ĐỔ BÓNG (shadow-lg) */}
            <div className="bg-white rounded-xl shadow-lg p-4 sticky top-24">
              <div className="mb-4 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  {/* 2. CHUẨN HÓA MÀU ICON HEADER */}
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <LayoutDashboard className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      Menu Quản trị
                    </p>
                    <p className="text-xs text-gray-500">
                      {menuItems.length} modules
                    </p>
                  </div>
                </div>
              </div>

              <nav className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      // 4. CHUẨN HÓA MÀU SẮC MENU DESKTOP
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all group ${
                          isActive
                            ? `bg-blue-600 text-white shadow-md` // Active
                            : `text-gray-600 hover:bg-gray-100` // Inactive
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <div
                            // 4. CHUẨN HÓA ICON BÊN TRONG NAVLINK
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                              isActive
                                ? "bg-white/20 text-white" // Active icon
                                : "bg-gray-100 text-gray-600 group-hover:bg-gray-200" // Inactive icon
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-sm flex-1">{item.label}</span>
                          {isActive && (
                            // Bỏ hiệu ứng animate-pulse
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </nav>

              {/* User Info Card */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                {/* 2. ĐỔI NỀN GRADIENT SANG NỀN ĐƠN SẮC */}
                <div className="bg-gray-100 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    {/* 2. CHUẨN HÓA AVATAR */}
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {user?.name?.[0]?.toUpperCase() ||
                        user?.email?.[0]?.toUpperCase() ||
                        "A"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {user?.name || "Admin"}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Role:</span>
                      {/* 2. CHUẨN HÓA MÀU ROLE */}
                      <span className="font-semibold text-blue-700 uppercase">
                        {user?.role}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* ✅ Main Content Area */}
          <main className="col-span-12 md:col-span-9 lg:col-span-10">
            {/* 5. TINH CHỈNH BO GÓC VÀ ĐỔ BÓNG */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}