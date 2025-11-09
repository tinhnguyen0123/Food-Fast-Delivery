import React, { useMemo, useState } from "react";
import { NavLink, Outlet, Navigate, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
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

  // ✅ Danh sách menu quản trị với icons
  const menuItems = [
    {
      to: "/admin/orders",
      label: "Quản lý Đơn hàng",
      icon: ShoppingBag,
      color: "from-blue-500 to-blue-600",
      bgLight: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      to: "/admin/users",
      label: "Quản lý Người dùng",
      icon: Users,
      color: "from-purple-500 to-purple-600",
      bgLight: "bg-purple-50",
      textColor: "text-purple-600",
    },
    {
      to: "/admin/restaurants",
      label: "Quản lý Nhà hàng",
      icon: Store,
      color: "from-orange-500 to-orange-600",
      bgLight: "bg-orange-50",
      textColor: "text-orange-600",
    },
    {
      to: "/admin/drones",
      label: "Quản lý Drone",
      icon: Plane,
      color: "from-indigo-500 to-indigo-600",
      bgLight: "bg-indigo-50",
      textColor: "text-indigo-600",
    },
    {
      to: "/admin/analytics",
      label: "Thống kê & Báo cáo",
      icon: BarChart3,
      color: "from-green-500 to-green-600",
      bgLight: "bg-green-50",
      textColor: "text-green-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* ✅ Header / Top Bar */}
      <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Title */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
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
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
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
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                          isActive
                            ? `bg-gradient-to-r ${item.color} text-white shadow-md`
                            : `${item.bgLight} ${item.textColor} hover:shadow-sm`
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
                className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
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
            <div className="bg-white rounded-2xl shadow-lg p-4 sticky top-24">
              <div className="mb-4 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
                    <LayoutDashboard className="w-5 h-5 text-indigo-600" />
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
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all group ${
                          isActive
                            ? `bg-gradient-to-r ${item.color} text-white shadow-md`
                            : `${item.bgLight} ${item.textColor} hover:shadow-sm hover:scale-102`
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                              isActive
                                ? "bg-white/20"
                                : "bg-white group-hover:scale-110"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-sm flex-1">{item.label}</span>
                          {isActive && (
                            <ChevronRight className="w-4 h-4 animate-pulse" />
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </nav>

              {/* User Info Card */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
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
                  <div className="mt-3 pt-3 border-t border-indigo-200">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Role:</span>
                      <span className="font-semibold text-indigo-700 uppercase">
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
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}