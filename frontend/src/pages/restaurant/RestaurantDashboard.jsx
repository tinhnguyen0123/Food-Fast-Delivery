import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import OrdersPage from "./OrderPage.jsx";
import MenuPage from "./MenuPage.jsx";
import DronesPage from "./DronePage.jsx";
import AnalyticsPage from "./AnalyticsPage.jsx";
import ProfilePage from "./Profile.jsx";
import {
  ShoppingCart,
  UtensilsCrossed,
  Plane,
  BarChart3,
  Store,
  LogOut,
  Menu as MenuIcon,
  X,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function RestaurantDashboard() {
  const [activeTab, setActiveTab] = useState("orders");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [restaurantName, setRestaurantName] = useState("");
  const [isApproved, setIsApproved] = useState(false);
  const [restaurantStatus, setRestaurantStatus] = useState("");
  const navigate = useNavigate();

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

  const token = localStorage.getItem("token");

  useEffect(() => {
    const loadRestaurantName = async () => {
      try {
        const rid = localStorage.getItem("myRestaurantId");
        if (rid) {
          const res = await fetch(`${API_BASE}/api/restaurant/${rid}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (res.ok) {
            setRestaurantName(data.name);
            setIsApproved(data.status === "verified");
            setRestaurantStatus(data.status);
          }
        } else {
          const res = await fetch(
            `${API_BASE}/api/restaurant/owner/${user?.id || user?._id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const list = await res.json();
          if (res.ok && Array.isArray(list) && list.length > 0) {
            localStorage.setItem("myRestaurantId", list[0]._id);
            setRestaurantName(list[0].name);
            setIsApproved(list[0].status === "verified");
            setRestaurantStatus(list[0].status);
          }
        }
      } catch (error) {
        console.error("Error loading restaurant name:", error);
      }
    };
    loadRestaurantName();
  }, [token, user?.id, user?._id]);

  const handleRestaurantUpdate = (newName) => {
    setRestaurantName(newName);
  };

  const handleLogout = async () => {
    try {
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
      localStorage.removeItem("myRestaurantId");
      navigate("/login", { replace: true });
    }
  };

  // ✅ Đổi màu sắc về 1 tông xanh chủ đạo
  const menuItems = [
    {
      key: "orders",
      label: "Đơn hàng",
      icon: ShoppingCart,
      color: "bg-blue-600", // Màu active
      bgLight: "bg-blue-50", // Màu nền nhạt
      textColor: "text-blue-700", // Màu chữ
    },
    {
      key: "menu",
      label: "Thực đơn",
      icon: UtensilsCrossed,
      color: "bg-blue-600",
      bgLight: "bg-blue-50",
      textColor: "text-blue-700",
    },
    {
      key: "drones",
      label: "Drone",
      icon: Plane,
      color: "bg-blue-600",
      bgLight: "bg-blue-50",
      textColor: "text-blue-700",
    },
    {
      key: "analytics",
      label: "Thống kê",
      icon: BarChart3,
      color: "bg-blue-600",
      bgLight: "bg-blue-50",
      textColor: "text-blue-700",
    },
    {
      key: "profile",
      label: "Hồ sơ",
      icon: Store,
      color: "bg-blue-600",
      bgLight: "bg-blue-50",
      textColor: "text-blue-700",
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "orders":
        return <OrdersPage />;
      case "menu":
        return <MenuPage />;
      case "drones":
        return <DronesPage />;
      case "analytics":
        return <AnalyticsPage />;
      case "profile":
        return <ProfilePage onUpdate={handleRestaurantUpdate} />;
      default:
        return <OrdersPage />;
    }
  };

  const activeMenuItem = menuItems.find((item) => item.key === activeTab);

  // Nội dung Sidebar (dùng chung cho desktop và mobile)
  const renderSidebarContent = (isMobile = false) => (
    <>
      {/* Sidebar Header */}
      <div className="flex items-center gap-4">
        {/* ✅ Đổi logo icon sang màu xanh */}
        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
          <Store className="w-7 h-7 text-white" />
        </div>
        <div>
          {/* ✅ Bỏ gradient chữ */}
          <h1 className="text-xl font-bold text-gray-900">
            Restaurant Dashboard
          </h1>
          <p className="text-sm text-gray-500">
            Xin chào,{" "}
            {/* ✅ Đổi tên sang màu xanh */}
            <span className="font-semibold text-blue-600">
              {restaurantName || "..."}
            </span>
          </p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.key;
          const disabled =
            (!isApproved && item.key !== "profile") ||
            restaurantStatus === "suspended";
          return (
            <button
              key={item.key}
              onClick={() => {
                if (!disabled) {
                  setActiveTab(item.key);
                  if (isMobile) setIsMobileMenuOpen(false);
                }
              }}
              disabled={disabled}
              // ✅ Thay đổi class cho nút
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                isActive
                  ? `${item.color} text-white shadow-md scale-105` // Active: nền xanh, chữ trắng
                  : `text-gray-700 hover:bg-gray-100 hover:scale-105 ${ // Inactive: chữ xám, hover xám nhạt
                      disabled
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div>
        {/* ✅ Đổi style nút logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-700 hover:bg-red-100 rounded-xl font-medium transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </>
  );

  return (
    // ✅ Đổi nền chính sang xám nhạt
    <div className="flex min-h-screen bg-gray-100">
      {/* --- 1. Desktop Sidebar --- */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-white shadow-xl p-6 space-y-6 flex-shrink-0">
        {renderSidebarContent(false)}
      </aside>

      {/* --- 2. Mobile Menu (Flyout) --- */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          {/* Mobile Sidebar Content */}
          <aside className="relative w-72 max-w-[80vw] bg-white h-full shadow-2xl p-6 flex flex-col space-y-6">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-gray-100 hover:bg-gray-200 z-10"
            >
              <X className="w-6 h-6 text-gray-700" />
            </button>
            {renderSidebarContent(true)}
          </aside>
        </div>
      )}

      {/* --- 3. Main Content Area --- */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header (chỉ chứa nút menu) */}
        <header className="lg:hidden bg-white shadow-md sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Hiển thị tab đang active trên mobile */}
              {activeMenuItem && (
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${activeMenuItem.bgLight} ${activeMenuItem.textColor}`}>
                  <activeMenuItem.icon className="w-5 h-5" />
                  <span className="font-bold text-sm">{activeMenuItem.label}</span>
                </div>
              )}
              
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <MenuIcon className="w-6 h-6 text-gray-700" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-6 w-full">
          {/* Banner nếu chưa duyệt */}
          {!isApproved && restaurantStatus !== "suspended" && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
              ⚠️ Tài khoản nhà hàng đang chờ duyệt. Bạn chỉ có thể cập nhật hồ sơ.
              Các tính năng khác sẽ được mở sau khi admin xác minh.
            </div>
          )}

          {/* Banner nếu bị khóa */}
          {restaurantStatus === "suspended" && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              ⚠️ Nhà hàng đã bị khóa bởi quản trị viên. Vui lòng liên hệ hỗ trợ.
            </div>
          )}

          {/* Tab Header */}
          <div className="mb-6">
            <div
              // ✅ Đổi nền tiêu đề tab sang trắng
              className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white shadow-md`}
            >
              {activeMenuItem && (
                <>
                  <div
                    // ✅ Đổi icon header sang nền xanh nhạt, chữ xanh đậm
                    className={`w-10 h-10 ${activeMenuItem.bgLight} rounded-xl flex items-center justify-center ${activeMenuItem.textColor}`}
                  >
                    <activeMenuItem.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2
                      // ✅ Đổi chữ tiêu đề sang xám đậm
                      className={`text-xl font-bold text-gray-900`}
                    >
                      {activeMenuItem.label}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {activeTab === "orders" && "Quản lý đơn hàng của bạn"}
                      {activeTab === "menu" && "Quản lý thực đơn nhà hàng"}
                      {activeTab === "drones" && "Quản lý drone giao hàng"}
                      {activeTab === "analytics" && "Xem thống kê doanh thu"}
                      {activeTab === "profile" && "Cập nhật thông tin nhà hàng"}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            {(isApproved && restaurantStatus !== "suspended") || activeTab === 'profile' ? (
              renderTabContent()
            ) : (
              <ProfilePage onUpdate={handleRestaurantUpdate} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}