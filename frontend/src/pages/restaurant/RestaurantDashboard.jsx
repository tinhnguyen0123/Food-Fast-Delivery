import { useState } from "react";
import { useNavigate } from "react-router-dom";
import OrdersPage from "./OrderPage.jsx";
import MenuPage from "./MenuPage.jsx";
import DronesPage from "./DronePage.jsx";
import AnalyticsPage from "./AnalyticsPage.jsx";
import ProfilePage from "./Profile.jsx";

// ✅ Định nghĩa API_BASE để gọi logout từ backend
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function RestaurantDashboard() {
  const [tab, setTab] = useState("orders");
  const navigate = useNavigate();

  // ✅ Hàm đăng xuất
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
      localStorage.removeItem("myRestaurantId");
      navigate("/login", { replace: true });
    }
  };

  const TabButton = ({ value, children }) => (
    <button
      type="button"
      onClick={() => setTab(value)}
      className={`px-4 py-2 rounded-full text-sm font-medium transition ${
        tab === value
          ? "bg-blue-600 text-white shadow"
          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="space-y-6">
      {/* ✅ Header có nút về trang chủ và đăng xuất */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Restaurant Dashboard</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition"
          >
            Đăng xuất
          </button>
        </div>
      </div>

      {/* ✅ Nút chọn tab */}
      <div className="flex gap-3 flex-wrap">
        <TabButton value="orders">Orders</TabButton>
        <TabButton value="menu">Menu</TabButton>
        <TabButton value="drones">Drones</TabButton>
        <TabButton value="analytics">Analytics</TabButton>
        <TabButton value="profile">Profile</TabButton>
      </div>

      {/* ✅ Nội dung hiển thị theo tab */}
      <div className="mt-4">
        {tab === "orders" && <OrdersPage />}
        {tab === "menu" && <MenuPage />}
        {tab === "drones" && <DronesPage />}
        {tab === "analytics" && <AnalyticsPage />}
        {tab === "profile" && <ProfilePage />}
      </div>
    </div>
  );
}

