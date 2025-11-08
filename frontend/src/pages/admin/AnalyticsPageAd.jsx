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

// ✅ Khai báo API base từ biến môi trường (hoặc mặc định localhost)
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function AnalyticsPage() {
  const [revenueData, setRevenueData] = useState([
    { date: "Nov 1", revenue: 4000, orders: 240, expenses: 2400 },
    { date: "Nov 2", revenue: 3000, orders: 221, expenses: 2210 },
    { date: "Nov 3", revenue: 2000, orders: 229, expenses: 2290 },
    { date: "Nov 4", revenue: 2780, orders: 200, expenses: 2000 },
    { date: "Nov 5", revenue: 1890, orders: 229, expenses: 2181 },
    { date: "Nov 6", revenue: 2390, orders: 200, expenses: 2500 },
    { date: "Nov 7", revenue: 3490, orders: 250, expenses: 2100 },
  ]);

  const [orderStatusData, setOrderStatusData] = useState([
    { name: "Hoàn thành", value: 450, color: "#10b981" },
    { name: "Đang giao", value: 120, color: "#3b82f6" },
    { name: "Chờ xử lý", value: 80, color: "#f59e0b" },
    { name: "Đã hủy", value: 30, color: "#ef4444" },
  ]);

  const [topRestaurants, setTopRestaurants] = useState([
    { name: "Pizza House", orders: 245, revenue: 12500 },
    { name: "Burger King", orders: 198, revenue: 9800 },
    { name: "Sushi Master", orders: 167, revenue: 15600 },
    { name: "Pasta Paradise", orders: 143, revenue: 8900 },
    { name: "Taco Bell", orders: 132, revenue: 7200 },
  ]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const token = localStorage.getItem("token");

    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/admin/analytics`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!mounted) return;

        if (res.ok) {
          const data = await res.json();
          if (data?.revenueData) setRevenueData(data.revenueData);
          if (data?.orderStatusData) setOrderStatusData(data.orderStatusData);
          if (data?.topRestaurants) setTopRestaurants(data.topRestaurants);
        }
      } catch (e) {
        console.error("fetch analytics", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAnalytics();
    return () => {
      mounted = false;
    };
  }, []);

  const metrics = [
    {
      label: "Tổng doanh thu",
      value: "$125,480",
      change: "+18.2%",
      trend: "up",
      icon: DollarSign,
      color: "from-green-500 to-emerald-600",
      bgLight: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      label: "Tổng đơn hàng",
      value: "4,583",
      change: "+12.5%",
      trend: "up",
      icon: ShoppingCart,
      color: "from-blue-500 to-indigo-600",
      bgLight: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      label: "Số nhà hàng",
      value: "142",
      change: "+5.3%",
      trend: "up",
      icon: Store,
      color: "from-orange-500 to-red-600",
      bgLight: "bg-orange-50",
      textColor: "text-orange-600",
    },
    {
      label: "Khách hàng",
      value: "2,847",
      change: "-2.4%",
      trend: "down",
      icon: Users,
      color: "from-purple-500 to-purple-600",
      bgLight: "bg-purple-50",
      textColor: "text-purple-600",
    },
  ];

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
                    name="Doanh thu ($)"
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
                      ${restaurant.revenue.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-semibold text-gray-700">
                      ${(restaurant.revenue / restaurant.orders).toFixed(2)}
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