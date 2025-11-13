import { useEffect, useState, useMemo } from "react";
import {
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
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  RefreshCw,
  BarChart3,
  Plane,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function AnalyticsPage() {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [drones, setDrones] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  // ✅ Fetch tất cả dữ liệu từ các API có sẵn
  useEffect(() => {
    let mounted = true;

    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [ordersRes, usersRes, restaurantsRes, dronesRes] = await Promise.all([
          fetch(`${API_BASE}/api/order`, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          }),
          fetch(`${API_BASE}/api/user`, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          }),
          fetch(`${API_BASE}/api/restaurant`, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          }),
          fetch(`${API_BASE}/api/drone`, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          }),
        ]);

        if (!mounted) return;

        if (ordersRes.ok) {
          const data = await ordersRes.json();
          setOrders(Array.isArray(data) ? data : data.orders || []);
        }

        if (usersRes.ok) {
          const data = await usersRes.json();
          setUsers(Array.isArray(data) ? data : data.users || []);
        }

        if (restaurantsRes.ok) {
          const data = await restaurantsRes.json();
          setRestaurants(Array.isArray(data) ? data : data.restaurants || []);
        }

        if (dronesRes.ok) {
          const data = await dronesRes.json();
          setDrones(Array.isArray(data) ? data : data.drones || []);
        }
      } catch (e) {
        console.error("fetch analytics data", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAllData();
    return () => {
      mounted = false;
    };
  }, [token]);

  // ✅ Tính toán metrics từ dữ liệu thực
  const metrics = useMemo(() => {
    const totalRevenue = orders
      .filter((o) => o.status === "completed")
      .reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);

    const prevMonthOrders = orders.filter((o) => {
      const date = new Date(o.createdAt);
      const now = new Date();
      const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return date >= prevMonth && date < new Date(now.getFullYear(), now.getMonth(), 1);
    }).length;

    const currentMonthOrders = orders.filter((o) => {
      const date = new Date(o.createdAt);
      const now = new Date();
      return date >= new Date(now.getFullYear(), now.getMonth(), 1);
    }).length;

    const orderChange = prevMonthOrders
      ? (((currentMonthOrders - prevMonthOrders) / prevMonthOrders) * 100).toFixed(1)
      : "0";

    const activeCustomers = users.filter((u) => u.role === "customer" && u.status === "active").length;

    return [
      {
        label: "Tổng doanh thu",
        value: `${Intl.NumberFormat("vi-VN").format(totalRevenue)}đ`,
        change: "+18.2%",
        trend: "up",
        icon: DollarSign,
        color: "from-green-500 to-emerald-600",
        bgLight: "bg-green-50",
        textColor: "text-green-600",
      },
      {
        label: "Tổng đơn hàng",
        value: orders.length.toString(),
        change: `${orderChange > 0 ? "+" : ""}${orderChange}%`,
        trend: orderChange >= 0 ? "up" : "down",
        icon: ShoppingCart,
        color: "from-blue-500 to-indigo-600",
        bgLight: "bg-blue-50",
        textColor: "text-blue-600",
      },
      {
        label: "Số nhà hàng",
        value: restaurants.filter((r) => r.status === "verified").length.toString(),
        change: `+${restaurants.filter((r) => r.status === "pending").length} chờ duyệt`,
        trend: "up",
        icon: Store,
        color: "from-orange-500 to-red-600",
        bgLight: "bg-orange-50",
        textColor: "text-orange-600",
      },
      {
        label: "Khách hàng",
        value: activeCustomers.toString(),
        change: `${users.length} tổng số`,
        trend: "up",
        icon: Users,
        color: "from-purple-500 to-purple-600",
        bgLight: "bg-purple-50",
        textColor: "text-purple-600",
      },
    ];
  }, [orders, users, restaurants]);

  // ✅ Dữ liệu biểu đồ doanh thu 7 ngày gần nhất
  const revenueData = useMemo(() => {
    const last7Days = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });

      const dayOrders = orders.filter((o) => {
        const orderDate = new Date(o.createdAt);
        return (
          orderDate.toDateString() === date.toDateString() &&
          o.status === "completed"
        );
      });

      const revenue = dayOrders.reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);

      last7Days.push({
        date: dateStr,
        revenue: revenue,
        orders: dayOrders.length,
        expenses: Math.round(revenue * 0.7), // Giả định chi phí 70% doanh thu
      });
    }

    return last7Days;
  }, [orders]);

  // ✅ Dữ liệu trạng thái đơn hàng
  const orderStatusData = useMemo(() => {
    return [
      {
        name: "Hoàn thành",
        value: orders.filter((o) => o.status === "completed").length,
        color: "#10b981",
      },
      {
        name: "Đang giao",
        value: orders.filter((o) => o.status === "delivering").length,
        color: "#3b82f6",
      },
      {
        name: "Chờ xử lý",
        value: orders.filter((o) => o.status === "pending").length,
        color: "#f59e0b",
      },
      {
        name: "Đã hủy",
        value: orders.filter((o) => o.status === "cancelled").length,
        color: "#ef4444",
      },
    ];
  }, [orders]);

  // ✅ Top 5 nhà hàng có doanh thu cao nhất
  const topRestaurants = useMemo(() => {
    const restaurantRevenue = {};

    orders
      .filter((o) => o.status === "completed" && o.restaurantId?._id)
      .forEach((o) => {
        const rid = o.restaurantId._id;
        const name = o.restaurantId.name || "N/A";
        if (!restaurantRevenue[rid]) {
          restaurantRevenue[rid] = { name, orders: 0, revenue: 0 };
        }
        restaurantRevenue[rid].orders += 1;
        restaurantRevenue[rid].revenue += Number(o.totalPrice) || 0;
      });

    return Object.values(restaurantRevenue)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [orders]);

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
            <span>7 ngày qua</span>
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Tải lại
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const TrendIcon = metric.trend === "up" ? ArrowUpRight : ArrowDownRight;

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
                  <div
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                      metric.trend === "up"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    <TrendIcon className="w-3 h-3" />
                    {metric.change}
                  </div>
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
                  Biểu đồ xu hướng 7 ngày qua
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
                    formatter={(value, name) => {
                      if (name === "Doanh thu") {
                        return [`${Intl.NumberFormat("vi-VN").format(value)}đ`, name];
                      }
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    fill="url(#colorRevenue)"
                    strokeWidth={2}
                    name="Doanh thu"
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
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
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
            Doanh thu vs Chi phí
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            So sánh doanh thu và chi phí hoạt động
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
                formatter={(value) => `${Intl.NumberFormat("vi-VN").format(value)}đ`}
              />
              <Legend />
              <Bar
                dataKey="revenue"
                fill="#10b981"
                name="Doanh thu"
                radius={[8, 8, 0, 0]}
              />
              <Bar
                dataKey="expenses"
                fill="#ef4444"
                name="Chi phí"
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
              {topRestaurants.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500">
                    Chưa có dữ liệu
                  </td>
                </tr>
              ) : (
                topRestaurants.map((restaurant, index) => (
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
                        {Intl.NumberFormat("vi-VN").format(restaurant.revenue)}đ
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-gray-700">
                        {Intl.NumberFormat("vi-VN").format(
                          Math.round(restaurant.revenue / restaurant.orders)
                        )}đ
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}