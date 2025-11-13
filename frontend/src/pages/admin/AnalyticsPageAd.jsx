import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  DollarSign,
  Users,
  Store,
  Plane,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download,
  RefreshCw,
  BarChart3,
} from "lucide-react";
import { toast } from "react-toastify";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function AnalyticsPage() {
  const [revenueData, setRevenueData] = useState([]);
  const [orderStatusData, setOrderStatusData] = useState([]);
  const [topRestaurants, setTopRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalRestaurants: 0,
    totalCustomers: 0,
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      // ✅ Fetch tất cả dữ liệu cần thiết
      const [ordersRes, usersRes, restaurantsRes] = await Promise.all([
        fetch(`${API_BASE}/api/order`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }),
        fetch(`${API_BASE}/api/user`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }),
        fetch(`${API_BASE}/api/restaurant`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }),
      ]);

      const orders = await ordersRes.json();
      const users = await usersRes.json();
      const restaurants = await restaurantsRes.json();

      // ✅ Xử lý dữ liệu
      if (Array.isArray(orders) && Array.isArray(users) && Array.isArray(restaurants)) {
        processAnalyticsData(orders, users, restaurants);
      }
    } catch (error) {
      console.error("Fetch analytics error:", error);
      toast.error("Lỗi tải dữ liệu phân tích");
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (orders, users, restaurants) => {
    // ✅ 1. Tính tổng doanh thu (chỉ tính các đơn đã completed)
    const totalRevenue = orders
      .filter((o) => o.status === "completed")
      .reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);

    // ✅ 2. Tổng đơn hàng
    const totalOrders = orders.length;

    // ✅ 3. Tổng nhà hàng
    const totalRestaurants = restaurants.length;

    // ✅ 4. Tổng khách hàng (chỉ tính customer)
    const totalCustomers = users.filter((u) => u.role === "customer").length;

    setMetrics({
      totalRevenue,
      totalOrders,
      totalRestaurants,
      totalCustomers,
    });

    // ✅ 5. Phân bố trạng thái đơn hàng
    const statusCounts = {
      pending: 0,
      preparing: 0,
      delivering: 0,
      completed: 0,
      cancelled: 0,
    };

    orders.forEach((o) => {
      if (statusCounts.hasOwnProperty(o.status)) {
        statusCounts[o.status]++;
      }
    });

    const statusData = [
      { name: "Hoàn thành", value: statusCounts.completed, color: "#10b981" },
      { name: "Đang giao", value: statusCounts.delivering, color: "#3b82f6" },
      { name: "Đang chuẩn bị", value: statusCounts.preparing, color: "#8b5cf6" },
      { name: "Chờ xử lý", value: statusCounts.pending, color: "#f59e0b" },
      { name: "Đã hủy", value: statusCounts.cancelled, color: "#ef4444" },
    ];

    setOrderStatusData(statusData);

    // ✅ 6. Top 5 nhà hàng có doanh thu cao nhất
    const restaurantRevenue = {};

    restaurants.forEach((r) => {
      restaurantRevenue[r._id] = {
        name: r.name,
        revenue: 0,
        orders: 0,
      };
    });

    orders.forEach((o) => {
      const rid = o.restaurantId?._id || o.restaurantId;
      if (restaurantRevenue[rid]) {
        restaurantRevenue[rid].orders++;
        if (o.status === "completed") {
          restaurantRevenue[rid].revenue += Number(o.totalPrice) || 0;
        }
      }
    });

    const topRestaurantsList = Object.values(restaurantRevenue)
      .filter((r) => r.revenue > 0)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map((r) => ({
        name: r.name,
        orders: r.orders,
        revenue: r.revenue,
      }));

    setTopRestaurants(topRestaurantsList);

    // ✅ 7. Dữ liệu xu hướng doanh thu theo ngày (7 ngày gần nhất)
    const revenueByDay = {};
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString("vi-VN", { month: "short", day: "numeric" });
      revenueByDay[dateStr] = { date: dateStr, revenue: 0, orders: 0, expenses: 0 };
    }

    orders.forEach((o) => {
      const orderDate = new Date(o.createdAt);
      const dateStr = orderDate.toLocaleDateString("vi-VN", { month: "short", day: "numeric" });

      if (revenueByDay[dateStr]) {
        revenueByDay[dateStr].orders++;
        if (o.status === "completed") {
          revenueByDay[dateStr].revenue += Number(o.totalPrice) || 0;
        }
      }
    });

    const chartData = Object.values(revenueByDay);
    setRevenueData(chartData);
  };

  const metricsList = [
    {
      label: "Tổng doanh thu",
      value: `${metrics.totalRevenue.toLocaleString("vi-VN")}₫`,
      // change: "+18.2%", // ĐÃ XÓA
      // trend: "up", // ĐÃ XÓA
      icon: DollarSign,
      color: "from-green-500 to-emerald-600",
      bgLight: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      label: "Tổng đơn hàng",
      value: metrics.totalOrders.toString(),
      // change: "+12.5%", // ĐÃ XÓA
      // trend: "up", // ĐÃ XÓA
      icon: ShoppingCart,
      color: "from-blue-500 to-indigo-600",
      bgLight: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      label: "Số nhà hàng",
      value: metrics.totalRestaurants.toString(),
      // change: "+5.3%", // ĐÃ XÓA
      // trend: "up", // ĐÃ XÓA
      icon: Store,
      color: "from-orange-500 to-red-600",
      bgLight: "bg-orange-50",
      textColor: "text-orange-600",
    },
    {
      label: "Khách hàng",
      value: metrics.totalCustomers.toString(),
      // change: "-2.4%", // ĐÃ XÓA
      // trend: "down", // ĐÃ XÓA
      icon: Users,
      color: "from-purple-500 to-purple-600",
      bgLight: "bg-purple-50",
      textColor: "text-purple-600",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Đang tải dữ liệu phân tích...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            Thống kê & Báo cáo
          </h1>
          <p className="text-gray-600 mt-1">
            Tổng quan về doanh thu và hiệu suất hệ thống
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all">
            <Calendar className="w-4 h-4" />
            <span>30 ngày qua</span>
          </button>
          <button
            onClick={fetchAnalytics}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Tải lại
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricsList.map((metric) => {
          const Icon = metric.icon;
          // const TrendIcon = metric.trend === "up" ? ArrowUpRight : ArrowDownRight; // KHÔNG CẦN NỮA

          return (
            <div
              key={metric.label}
              className="bg-white rounded-xl shadow-lg border-2 border-gray-200 hover:shadow-xl hover:border-green-300 transition-all duration-200"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center ${metric.bgLight}`}
                  >
                    <Icon className={`w-6 h-6 ${metric.textColor}`} />
                  </div>
                  
                  {/* ===== KHỐI NÀY ĐÃ BỊ XÓA THEO YÊU CẦU ===== */}
                  {/* <div
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                      metric.trend === "up"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    <TrendIcon className="w-3 h-3" />
                    {metric.change}
                  </div> */}
                  {/* ============================================== */}

                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">{metric.label}</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {metric.value}
                  </p>
                </div>
              </div>
              <div className={`h-1 bg-gradient-to-r ${metric.color}`} />
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue & Orders Chart - 2/3 width */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Doanh thu & Đơn hàng
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Biểu đồ xu hướng theo ngày
                </p>
              </div>
            </div>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center h-[300px]">
                <div className="animate-spin h-8 w-8 border-4 border-green-600 border-t-transparent rounded-full" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    stroke="#6b7280"
                    style={{ fontSize: "12px" }}
                  />
                  <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    fill="url(#colorRevenue)"
                    strokeWidth={2}
                    name="Doanh thu (₫)"
                  />
                  <Area
                    type="monotone"
                    dataKey="orders"
                    stroke="#3b82f6"
                    fill="url(#colorOrders)"
                    strokeWidth={2}
                    name="Đơn hàng"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Order Status Pie Chart - 1/3 width */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Trạng thái đơn
            </h2>
            <p className="text-sm text-gray-600 mt-1">Phân bổ theo trạng thái</p>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  // ===== ĐÃ XÓA PROP 'label' ĐỂ TRÁNH CHỒNG CHÉO =====
                  // label={({ name, percent }) =>
                  //   `${name} ${(percent * 100).toFixed(0)}%`
                  // }
                  // ====================================================
                  outerRadius={100} // Tăng kích thước 1 chút
                  fill="#8884d8"
                  dataKey="value"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-3 mt-4">
              {orderStatusData.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <div>
                    <p className="text-xs text-gray-600">{item.name}</p>
                    <p className="text-sm font-bold text-gray-800">
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Revenue vs Expenses Bar Chart */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Doanh thu theo ngày
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            So sánh doanh thu hàng ngày (7 ngày gần nhất)
          </p>
        </div>
        <div className="p-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: "12px" }} />
              <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                }}
              />
              <Legend />
              <Bar
                dataKey="revenue"
                fill="#10b981"
                name="Doanh thu (₫)"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Restaurants Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Store className="w-5 h-5 text-orange-600" />
            Top Nhà hàng
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            5 nhà hàng có doanh thu cao nhất
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-sm text-gray-700">
                  #
                </th>
                <th className="text-left py-4 px-6 font-semibold text-sm text-gray-700">
                  Nhà hàng
                </th>
                <th className="text-left py-4 px-6 font-semibold text-sm text-gray-700">
                  Đơn hàng
                </th>
                <th className="text-left py-4 px-6 font-semibold text-sm text-gray-700">
                  Doanh thu
                </th>
                <th className="text-left py-4 px-6 font-semibold text-sm text-gray-700">
                  Trung bình/Đơn
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {topRestaurants.map((restaurant, index) => (
                <tr key={restaurant.name} className="hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                        index === 0
                          ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                          : index === 1
                          ? "bg-gradient-to-r from-gray-400 to-gray-500"
                          : index === 2
                          ? "bg-gradient-to-r from-orange-600 to-red-600"
                          : "bg-gray-300"
                      }`}
                    >
                      {index + 1}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Store className="w-5 h-5 text-orange-600" />
                      </div>
                      <span className="font-semibold text-gray-800">
                        {restaurant.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-blue-600" />
                      <span className="font-semibold text-gray-800">
                        {restaurant.orders}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-bold text-green-600">
                      {restaurant.revenue.toLocaleString("vi-VN")}₫
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-semibold text-gray-700">
                      {restaurant.orders > 0
                        // ===== ĐÃ THÊM Math.round() =====
                        ? Math.round(
                            restaurant.revenue / restaurant.orders
                          ).toLocaleString("vi-VN")
                        : "0"}
                      ₫
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}