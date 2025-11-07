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
} from "recharts";
import { toast } from "react-toastify";

export default function AnalyticsPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
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
        `http://localhost:5000/api/restaurant/owner/${user.id || user._id}`,
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

      const res = await fetch(
        `http://localhost:5000/api/order/restaurant/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

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
    let total = 0;
    let completed = 0;

    (orders || []).forEach((o) => {
      const day = new Date(o.createdAt).toLocaleDateString("vi-VN", {
        weekday: "short",
      });
      byDay[day] = byDay[day] || { day, revenue: 0, orders: 0 };
      byDay[day].orders += 1;

      const rev = o.totalPrice || 0;
      if (o.status === "completed") {
        byDay[day].revenue += rev;
        total += rev;
        completed += 1;
      }
    });

    const trend = Object.values(byDay);

    return {
      trend,
      totalRevenue: total,
      orderCount: orders.length,
      completionRate: orders.length
        ? ((completed / orders.length) * 100).toFixed(1)
        : 0,
      avgOrderValue: completed ? Math.round(total / completed) : 0,
    };
  }, [orders]);

  // ✅ Giao diện chính
  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">Phân tích & Doanh thu</h1>
        <p className="text-gray-500 text-sm">
          Thống kê dựa trên dữ liệu đơn hàng
        </p>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Đang tải...</div>
      ) : (
        <>
          {/* Thông tin tổng quan */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="border rounded p-4">
              <p className="text-gray-500 text-sm">Tổng doanh thu</p>
              <p className="text-2xl font-bold text-blue-700">
                {Intl.NumberFormat("vi-VN").format(summary.totalRevenue)} đ
              </p>
            </div>
            <div className="border rounded p-4">
              <p className="text-gray-500 text-sm">Tổng đơn</p>
              <p className="text-2xl font-bold">{summary.orderCount}</p>
            </div>
            <div className="border rounded p-4">
              <p className="text-gray-500 text-sm">Tỉ lệ hoàn tất</p>
              <p className="text-2xl font-bold">{summary.completionRate}%</p>
            </div>
            <div className="border rounded p-4">
              <p className="text-gray-500 text-sm">Giá trị đơn TB</p>
              <p className="text-2xl font-bold">
                {Intl.NumberFormat("vi-VN").format(summary.avgOrderValue)} đ
              </p>
            </div>
          </div>

          {/* Biểu đồ doanh thu & đơn hàng */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="border rounded p-4">
              <h3 className="font-semibold mb-2">Xu hướng doanh thu</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={summary.trend}>
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                      <stop
                        offset="95%"
                        stopColor="#2563eb"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#2563eb"
                    fill="url(#rev)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="border rounded p-4">
              <h3 className="font-semibold mb-2">Số đơn theo ngày</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={summary.trend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="orders"
                    fill="#10b981"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
