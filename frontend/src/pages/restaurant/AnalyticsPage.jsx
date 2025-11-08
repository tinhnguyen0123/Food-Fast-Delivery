import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { toast } from "react-toastify";
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  CheckCircle,
  Clock,
  XCircle,
  Package,
  Calendar,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function AnalyticsPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("week"); // week, month, year
  const token = localStorage.getItem("token");
  const [rid, setRid] = useState(localStorage.getItem("myRestaurantId") || "");

  // ✅ Hàm đảm bảo lấy đúng restaurantId
  const ensureRestaurantId = async () => {
    if (rid) return rid;

    const cached = localStorage.getItem("myRestaurantId");
    if (cached) {
      setRid(cached);
      return cached;
    }

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const res = await fetch(
        `${API_BASE}/api/restaurant/owner/${user.id || user._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const list = await res.json();
      if (!res.ok || !Array.isArray(list) || list.length === 0) return "";

      const id = list[0]._id;
      setRid(id);
      localStorage.setItem("myRestaurantId", id);
      return id;
    } catch (error) {
      console.error(error);
      return "";
    }
  };

  // ✅ Tải dữ liệu thống kê theo nhà hàng cụ thể
  const loadOrders = async () => {
    setLoading(true);
    try {
      const id = await ensureRestaurantId();
      if (!id) {
        setOrders([]);
        return;
      }

      const res = await fetch(`${API_BASE}/api/order/restaurant/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Tải dữ liệu thất bại");

      setOrders(Array.isArray(data) ? data : data.orders || []);
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // ✅ Tính toán dữ liệu tổng hợp
  const summary = useMemo(() => {
    const byDay = {};
    const byStatus = {
      pending: 0,
      preparing: 0,
      delivering: 0,
      completed: 0,
      cancelled: 0,
    };

    let total = 0;
    let completed = 0;
    let cancelled = 0;

    (orders || []).forEach((o) => {
      const day = new Date(o.createdAt).toLocaleDateString("vi-VN", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });

      byDay[day] = byDay[day] || { day, revenue: 0, orders: 0 };
      byDay[day].orders += 1;

      // Count by status
      if (byStatus.hasOwnProperty(o.status)) {
        byStatus[o.status] += 1;
      }

      const rev = o.totalPrice || 0;
      if (o.status === "completed") {
        byDay[day].revenue += rev;
        total += rev;
        completed += 1;
      }

      if (o.status === "cancelled") {
        cancelled += 1;
      }
    });

    const trend = Object.values(byDay);

    // Prepare status chart data
    const statusData = [
      { name: "Chờ xử lý", value: byStatus.pending, color: "#f59e0b" },
      { name: "Đang chuẩn bị", value: byStatus.preparing, color: "#3b82f6" },
      { name: "Đang giao", value: byStatus.delivering, color: "#8b5cf6" },
      { name: "Hoàn thành", value: byStatus.completed, color: "#10b981" },
      { name: "Đã hủy", value: byStatus.cancelled, color: "#ef4444" },
    ];

    return {
      trend,
      statusData,
      totalRevenue: total,
      orderCount: orders.length,
      completedCount: completed,
      cancelledCount: cancelled,
      completionRate: orders.length
        ? ((completed / orders.length) * 100).toFixed(1)
        : 0,
      avgOrderValue: completed ? Math.round(total / completed) : 0,
    };
  }, [orders]);

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
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-blue-600" />
            Phân tích & Doanh thu
          </h1>
          <p className="text-gray-600 mt-1">
            Theo dõi hiệu suất kinh doanh và xu hướng đơn hàng
          </p>
        </div>

        {/* Time Range Filter */}
        <div className="flex items-center gap-2 bg-white rounded-xl shadow-sm border border-gray-200 p-1">
          <button
            onClick={() => setTimeRange("week")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              timeRange === "week"
                ? "bg-blue-600 text-white shadow"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Tuần
          </button>
          <button
            onClick={() => setTimeRange("month")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              timeRange === "month"
                ? "bg-blue-600 text-white shadow"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Tháng
          </button>
          <button
            onClick={() => setTimeRange("year")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              timeRange === "year"
                ? "bg-blue-600 text-white shadow"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Năm
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <TrendingUp className="w-5 h-5 opacity-80" />
          </div>
          <p className="text-blue-100 text-sm mb-1">Tổng doanh thu</p>
          <p className="text-3xl font-bold">
            {Intl.NumberFormat("vi-VN").format(summary.totalRevenue)}đ
          </p>
          <p className="text-blue-100 text-xs mt-2">
            Từ {summary.completedCount} đơn hoàn thành
          </p>
        </div>

        {/* Total Orders */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <Package className="w-5 h-5 opacity-80" />
          </div>
          <p className="text-purple-100 text-sm mb-1">Tổng đơn hàng</p>
          <p className="text-3xl font-bold">{summary.orderCount}</p>
          <p className="text-purple-100 text-xs mt-2">
            Tất cả trạng thái
          </p>
        </div>

        {/* Completion Rate */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
            <TrendingUp className="w-5 h-5 opacity-80" />
          </div>
          <p className="text-green-100 text-sm mb-1">Tỉ lệ hoàn thành</p>
          <p className="text-3xl font-bold">{summary.completionRate}%</p>
          <p className="text-green-100 text-xs mt-2">
            {summary.completedCount}/{summary.orderCount} đơn
          </p>
        </div>

        {/* Average Order Value */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <DollarSign className="w-5 h-5 opacity-80" />
          </div>
          <p className="text-orange-100 text-sm mb-1">Giá trị đơn TB</p>
          <p className="text-3xl font-bold">
            {Intl.NumberFormat("vi-VN").format(summary.avgOrderValue)}đ
          </p>
          <p className="text-orange-100 text-xs mt-2">
            Trên mỗi đơn hoàn thành
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue Trend Chart */}
        <div className="xl:col-span-2 bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Xu hướng doanh thu
            </h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              7 ngày gần nhất
            </span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={summary.trend}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="day"
                stroke="#6b7280"
                style={{ fontSize: "12px" }}
              />
              <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#2563eb"
                strokeWidth={2}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-600" />
              Phân bố trạng thái
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={summary.statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {summary.statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Orders Bar Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-green-600" />
            Số lượng đơn hàng theo ngày
          </h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            7 ngày gần nhất
          </span>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={summary.trend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="day"
              stroke="#6b7280"
              style={{ fontSize: "12px" }}
            />
            <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Bar dataKey="orders" fill="#10b981" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-green-500">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Đơn hoàn thành</p>
              <p className="text-2xl font-bold text-gray-800">
                {summary.completedCount}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-red-500">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Đơn đã hủy</p>
              <p className="text-2xl font-bold text-gray-800">
                {summary.cancelledCount}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-blue-500">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Đơn đang xử lý</p>
              <p className="text-2xl font-bold text-gray-800">
                {summary.orderCount - summary.completedCount - summary.cancelledCount}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}