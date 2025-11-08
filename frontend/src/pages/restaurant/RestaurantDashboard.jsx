// ...existing code...
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import OrdersPage from "./OrderPage.jsx";
import MenuPage from "./MenuPage.jsx";
import DronesPage from "./DronePage.jsx";
import AnalyticsPage from "./AnalyticsPage.jsx";
import ProfilePage from "./Profile.jsx";
// Icons
import {
  ShoppingCart,
  Grid,
  Airplay,
  BarChart2,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function RestaurantDashboard() {
  const [tab, setTab] = useState("orders");
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setCollapsed(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

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

  const items = [
    { key: "orders", label: "Orders", subtitle: "Quản lý đơn hàng", Icon: ShoppingCart },
    { key: "menu", label: "Menu", subtitle: "Quản lý món ăn", Icon: Grid },
    { key: "drones", label: "Drones", subtitle: "Quản lý drone giao hàng", Icon: Airplay },
    { key: "analytics", label: "Analytics", subtitle: "Doanh thu & báo cáo", Icon: BarChart2 },
    { key: "profile", label: "Profile", subtitle: "Hồ sơ nhà hàng", Icon: User },
  ];

  const renderTab = () => {
    switch (tab) {
      case "orders":
        return <OrdersPage />;
      case "menu":
        return <MenuPage />;
      case "drones":
        return <DronesPage />;
      case "analytics":
        return <AnalyticsPage />;
      case "profile":
        return <ProfilePage />;
      default:
        return <OrdersPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* ✅ Header chính */}
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCollapsed((c) => !c)}
              className="p-2 rounded-md bg-white shadow-sm hover:bg-gray-100 hidden md:inline-flex"
              aria-label="Toggle sidebar"
            >
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Restaurant Dashboard</h1>
              <p className="text-sm text-gray-500">Quản lý nhà hàng — nhanh, trực quan</p>
            </div>
          </div>

          {/* ✅ Chỉ còn nút đăng xuất */}
          <button
            onClick={handleLogout}
            className="px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700 text-sm"
          >
            Đăng xuất
          </button>
        </header>

        {/* ✅ Bố cục: sidebar + main content */}
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <aside
            className={`col-span-12 md:col-span-3 lg:col-span-2 transition-all duration-200 ${
              collapsed ? "md:w-20 md:col-span-1" : "md:col-span-3 lg:col-span-2"
            }`}
          >
            <div className="bg-white rounded-lg p-3 shadow h-full flex flex-col">
              {/* Thông tin user */}
              <div className="flex items-center gap-3 px-2 py-2">
                <div
                  className={`w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-xl font-semibold text-gray-600 transition ${
                    collapsed ? "mx-auto" : ""
                  }`}
                >
                  {user?.name?.charAt(0) ?? "R"}
                </div>
                {!collapsed && (
                  <div>
                    <div className="font-medium">{user?.name || "Restaurant"}</div>
                    <div className="text-xs text-gray-500">{user?.email || ""}</div>
                  </div>
                )}
              </div>

              {/* Menu điều hướng */}
              <nav className="mt-3 flex-1">
                {items.map(({ key, label, subtitle, Icon }) => (
                  <button
                    key={key}
                    onClick={() => setTab(key)}
                    title={label}
                    className={`w-full text-left flex items-center gap-3 px-3 py-2 my-1 rounded-md transition-colors ${
                      tab === key
                        ? "bg-blue-600 text-white shadow"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Icon size={18} />
                    {!collapsed && (
                      <div className="flex flex-col text-sm">
                        <span className="font-medium">{label}</span>
                        <span
                          className={`text-xs ${
                            tab === key ? "text-blue-100" : "text-gray-400"
                          }`}
                        >
                          {subtitle}
                        </span>
                      </div>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Nội dung chính */}
          <main className="col-span-12 md:col-span-9 lg:col-span-10">
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-4">
                {/* Mini header trong content */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold">
                      {items.find((i) => i.key === tab)?.label}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {items.find((i) => i.key === tab)?.subtitle}
                    </p>
                  </div>
                </div>

                {/* Nội dung tab */}
                <div>{renderTab()}</div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
// ...existing code...
