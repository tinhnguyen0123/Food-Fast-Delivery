import { useEffect, useState } from "react";
import {
  Search,
  Eye,
  Filter,
  Download,
  RefreshCw,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  ChefHat,
  AlertCircle,
  Calendar,
  DollarSign,
  User,
  Store,
  Plane,
} from "lucide-react";

// ✅ Khai báo API base từ biến môi trường (hoặc mặc định localhost)
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    let mounted = true;
    const token = localStorage.getItem("token");

    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/order`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        if (!mounted) return;

        if (res.status === 401) {
          setError("Unauthorized — please login again");
          setOrders([]);
          return;
        }

        if (!res.ok) {
          setOrders([]);
          return;
        }

        const data = await res.json();
        setOrders(Array.isArray(data) ? data : data.orders || []);
      } catch (err) {
        console.error("fetch orders", err);
        setError("Failed to load orders");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchOrders();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = orders.filter((o) => {
    const matchesSearch =
      !search ||
      (o.orderNumber && o.orderNumber.includes(search)) ||
      (o.customer && o.customer.toLowerCase().includes(search.toLowerCase())) ||
      (o._id && o._id.toLowerCase().includes(search.toLowerCase()));
    const matchesFilter = filter === "all" || o.status === filter;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-300", icon: Clock },
      preparing: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-300", icon: ChefHat },
      ready: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-300", icon: Package },
      delivering: { bg: "bg-indigo-100", text: "text-indigo-700", border: "border-indigo-300", icon: Truck },
      completed: { bg: "bg-green-100", text: "text-green-700", border: "border-green-300", icon: CheckCircle },
      cancelled: { bg: "bg-red-100", text: "text-red-700", border: "border-red-300", icon: XCircle },
    };
    return badges[status] || { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-300", icon: AlertCircle };
  };

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    preparing: orders.filter((o) => o.status === "preparing").length,
    delivering: orders.filter((o) => o.status === "delivering").length,
    completed: orders.filter((o) => o.status === "completed").length,
    totalRevenue: orders
      .filter((o) => o.status === "completed")
      .reduce((sum, o) => sum + (o.total || 0), 0),
  };

  const statusFilters = [
    { value: "all", label: "Tất cả", icon: Package, count: stats.total },
    { value: "pending", label: "Chờ xử lý", icon: Clock, count: stats.pending },
    { value: "preparing", label: "Đang chuẩn bị", icon: ChefHat, count: stats.preparing },
    { value: "delivering", label: "Đang giao", icon: Truck, count: stats.delivering },
    { value: "completed", label: "Hoàn thành", icon: CheckCircle, count: stats.completed },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            Quản lý Đơn hàng
          </h1>
          <p className="text-gray-600 mt-1">
            Theo dõi và quản lý tất cả đơn hàng trong hệ thống
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Tải lại
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold">{stats.total}</span>
          </div>
          <p className="text-blue-100 text-sm">Tổng đơn hàng</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold">{stats.pending}</span>
          </div>
          <p className="text-yellow-100 text-sm">Chờ xử lý</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Truck className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold">{stats.delivering}</span>
          </div>
          <p className="text-indigo-100 text-sm">Đang giao hàng</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold">
              ${stats.totalRevenue.toLocaleString()}
            </span>
          </div>
          <p className="text-green-100 text-sm">Doanh thu</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex flex-col gap-4">
          {/* Status Filters */}
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((f) => {
              const Icon = f.icon;
              return (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                    filter === f.value
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{f.label}</span>
                  <span
                    className={`ml-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                      filter === f.value
                        ? "bg-white/20 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {f.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                placeholder="Tìm kiếm đơn hàng theo ID, khách hàng..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Filter className="w-5 h-5 text-blue-600" />
              Danh sách đơn hàng ({filtered.length})
            </h2>
            <p className="text-sm text-gray-600">
              Hiển thị {filtered.length} / {orders.length} đơn
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="text-center">
                <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-gray-600">Đang tải đơn hàng...</p>
              </div>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 font-semibold">{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Không tìm thấy đơn hàng</p>
              <p className="text-gray-400 text-sm mt-1">
                Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Mã đơn
                    </div>
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Khách hàng
                    </div>
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4" />
                      Nhà hàng
                    </div>
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-sm text-gray-700">
                    Trạng thái
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Giá trị
                    </div>
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <Plane className="w-4 h-4" />
                      Drone
                    </div>
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Ngày tạo
                    </div>
                  </th>
                  <th className="text-center py-4 px-6 font-semibold text-sm text-gray-700">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((order) => {
                  const badge = getStatusBadge(order.status);
                  const Icon = badge.icon;

                  return (
                    <tr
                      key={order._id || order.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="font-mono text-sm font-semibold text-blue-600">
                          #{order.orderNumber || order._id?.slice(-8)}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm font-medium text-gray-800">
                          {order.customer?.name || order.customer || "-"}
                        </div>
                        {order.customer?.email && (
                          <div className="text-xs text-gray-500">
                            {order.customer.email}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm font-medium text-gray-800">
                          {order.restaurant?.name || order.restaurant || "-"}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm font-bold text-green-600">
                          ${order.total?.toLocaleString() || "0"}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-gray-600">
                          {order.droneId ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium">
                              <Plane className="w-3 h-3" />
                              {order.droneId.slice(-6)}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-gray-600">
                          {new Date(
                            order.createdAt || order.created || order.date
                          ).toLocaleDateString("vi-VN")}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(
                            order.createdAt || order.created || order.date
                          ).toLocaleTimeString("vi-VN")}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="inline-flex items-center gap-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="text-sm font-medium">Xem</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-800">
                  Chi tiết đơn hàng
                </h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircle className="w-6 h-6 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <pre className="text-sm bg-gray-50 p-4 rounded-lg overflow-auto">
                {JSON.stringify(selectedOrder, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
