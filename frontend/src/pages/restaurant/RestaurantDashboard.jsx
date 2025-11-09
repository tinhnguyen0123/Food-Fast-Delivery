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
  X
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function RestaurantDashboard() {
  const [activeTab, setActiveTab] = useState("orders");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [restaurantName, setRestaurantName] = useState("");
  const [isApproved, setIsApproved] = useState(false); 
  const [restaurantStatus, setRestaurantStatus] = useState(""); // ✅ Thêm state trạng thái
  const navigate = useNavigate();

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

  const token = localStorage.getItem("token");

  // ✅ Load tên và trạng thái duyệt / khóa của nhà hàng
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
            setRestaurantStatus(data.status); // ✅ lưu trạng thái
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
            setRestaurantStatus(list[0].status); // ✅ lưu trạng thái
          }
        }
      } catch (error) {
        console.error("Error loading restaurant name:", error);
      }
    };
    loadRestaurantName();
  }, []);

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

  const menuItems = [
    { 
      key: "orders", label: "Đơn hàng", icon: ShoppingCart,
      color: "from-blue-500 to-blue-600", bgLight: "bg-blue-50", textColor: "text-blue-600"
    },
    { 
      key: "menu", label: "Thực đơn", icon: UtensilsCrossed,
      color: "from-orange-500 to-orange-600", bgLight: "bg-orange-50", textColor: "text-orange-600"
    },
    { 
      key: "drones", label: "Drone", icon: Plane,
      color: "from-purple-500 to-purple-600", bgLight: "bg-purple-50", textColor: "text-purple-600"
    },
    { 
      key: "analytics", label: "Thống kê", icon: BarChart3,
      color: "from-green-500 to-green-600", bgLight: "bg-green-50", textColor: "text-green-600"
    },
    { 
      key: "profile", label: "Hồ sơ", icon: Store,
      color: "from-pink-500 to-pink-600", bgLight: "bg-pink-50", textColor: "text-pink-600"
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "orders": return <OrdersPage />;
      case "menu": return <MenuPage />;
      case "drones": return <DronesPage />;
      case "analytics": return <AnalyticsPage />;
      case "profile": return <ProfilePage onUpdate={handleRestaurantUpdate} />;
      default: return <OrdersPage />;
    }
  };

  const activeMenuItem = menuItems.find(item => item.key === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                <Store className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Restaurant Dashboard
                </h1>
                <p className="text-sm text-gray-500">
                  Xin chào,{" "}
                  <span className="font-semibold text-orange-600">
                    {restaurantName || "..."}
                  </span>
                </p>
              </div>
            </div>

            {/* Navigation Desktop */}
            <nav className="hidden lg:flex items-center gap-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => setActiveTab(item.key)}
                    disabled={
                      (!isApproved && item.key !== "profile") ||
                      restaurantStatus === "suspended"
                    }
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                      isActive
                        ? `bg-gradient-to-r ${item.color} text-white shadow-lg scale-105`
                        : `${item.bgLight} ${item.textColor} hover:scale-105 ${
                            (!isApproved && item.key !== "profile") ||
                            restaurantStatus === "suspended"
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

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleLogout}
                className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <LogOut className="w-5 h-5" />
                <span>Đăng xuất</span>
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6 text-gray-700" /> : <MenuIcon className="w-6 h-6 text-gray-700" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="lg:hidden mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-3 mb-4">
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
                          setIsMobileMenuOpen(false);
                        }
                      }}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl font-medium transition-all duration-200 ${
                        isActive
                          ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                          : `${item.bgLight} ${item.textColor}`
                      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <Icon className="w-6 h-6" />
                      <span className="text-sm">{item.label}</span>
                    </button>
                  );
                })}
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-all duration-200"
              >
                <LogOut className="w-5 h-5" />
                <span>Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
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
          <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl ${activeMenuItem?.bgLight} shadow-md`}>
            {activeMenuItem && (
              <>
                <div className={`w-10 h-10 bg-gradient-to-r ${activeMenuItem.color} rounded-xl flex items-center justify-center`}>
                  <activeMenuItem.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className={`text-xl font-bold ${activeMenuItem.textColor}`}>
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
          {(isApproved && restaurantStatus !== "suspended") ? renderTabContent() : (
            <ProfilePage onUpdate={handleRestaurantUpdate} />
          )}
        </div>
      </main>
    </div>
  );
}
