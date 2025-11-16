import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Package,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import OrderCard from "../../components/OrderCard";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function OrdersPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [refreshFlag, setRefreshFlag] = useState(0);
  
  // Phân trang
  const [page, setPage] = useState(1);
  const [limit] = useState(10); // Số đơn hàng mỗi trang

  const token = localStorage.getItem("token");

  useEffect(() => {
    const wanted = location.state?.status;
    if (wanted) setSelectedStatus(wanted);
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, refreshFlag]);

  // Reset về trang 1 khi đổi trạng thái
  useEffect(() => {
    setPage(1);
  }, [selectedStatus]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user") || "null");

      if (!token || !user) {
        console.warn("No token/user when loading orders");
        navigate("/login");
        return;
      }

      const res = await fetch(`${API_BASE}/api/order/user/${user.id || user._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      if (res.status === 404) {
        setOrders([]);
        return;
      }

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Không thể tải đơn hàng");
      }

      const data = await res.json();
      setOrders(Array.isArray(data) ? data : data.orders || []);
    } catch (err) {
      console.error("Load orders error:", err);
      toast.error(err.message || "Lỗi khi tải đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const cancelOrderById = async (orderId) => {
    if (!orderId) return;
    if (!window.confirm("Bạn có chắc muốn hủy đơn này?")) return;

    try {
      const res = await fetch(`${API_BASE}/api/order/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "cancelled" }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Hủy đơn thất bại");
      }

      toast.success("Hủy đơn thành công");
      setRefreshFlag((v) => v + 1);
    } catch (err) {
      console.error("Cancel order error:", err);
      toast.error(err.message || "Lỗi khi hủy đơn");
    }
  };

  const statusCounts = useMemo(() => {
    return orders.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {});
  }, [orders]);

  const tabs = [
    { key: "all", label: "Tất cả", icon: Package, color: "gray" },
    { key: "pending", label: "Chờ xử lý", icon: Clock, color: "yellow" },
    { key: "preparing", label: "Đang chuẩn bị", icon: ShoppingBag, color: "blue" },
    { key: "delivering", label: "Đang giao", icon: Truck, color: "purple" },
    { key: "completed", label: "Đã giao", icon: CheckCircle, color: "green" },
    { key: "cancelled", label: "Đã hủy", icon: XCircle, color: "red" },
  ];

  // Lọc theo trạng thái
  const filteredOrders = useMemo(() => {
    return selectedStatus === "all"
      ? orders
      : orders.filter((o) => o.status === selectedStatus);
  }, [orders, selectedStatus]);

  // Phân trang
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / limit));
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  // Tạo danh sách số trang
  const getPageNumbers = () => {
    const maxButtons = 5;
    let startPage = Math.max(1, page - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const EmptyStatusView = ({ statusKey }) => (
    <div className="text-center py-20 bg-white rounded-xl shadow-md">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Package className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        Không có đơn hàng
      </h3>
      <p className="text-gray-600 mb-6">
        Bạn chưa có đơn hàng nào ở trạng thái "
        {tabs.find((t) => t.key === statusKey)?.label || statusKey}"
      </p>
      <button
        onClick={() => navigate("/products")}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 inline-flex items-center gap-2 font-semibold"
      >
        <ShoppingBag className="w-5 h-5" />
        Đặt hàng ngay
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Đang tải đơn hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Đơn hàng của bạn
          </h1>
          <p className="text-lg text-gray-700">
            Theo dõi và quản lý đơn hàng của bạn
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8 bg-white rounded-xl shadow-md p-2">
          <div className="flex flex-wrap items-center">
            {tabs.map((tab) => {
              const isActive = selectedStatus === tab.key;
              const count =
                tab.key === "all" ? orders.length : statusCounts[tab.key] || 0;

              return (
                <button
                  key={tab.key}
                  onClick={() => setSelectedStatus(tab.key)}
                  className={`flex-auto px-4 py-3 rounded-lg text-center font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  {tab.label}
                  <span
                    className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <EmptyStatusView statusKey={selectedStatus} />
        ) : (
          <>
            <div className="space-y-4 mb-8">
              {paginatedOrders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  onCancel={cancelOrderById}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col items-center gap-4 bg-white rounded-xl shadow-md p-6">
                {/* Thông tin trang */}
                <div className="text-sm text-gray-600">
                  Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredOrders.length)} trong tổng số{" "}
                  {filteredOrders.length} đơn hàng
                </div>

                {/* Nút phân trang */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="h-10 px-4 rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    <span className="hidden sm:inline">Trước</span>
                  </button>

                  {getPageNumbers().map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`h-10 min-w-[40px] px-3 rounded-xl border text-sm font-semibold transition-all ${
                        pageNum === page
                          ? "bg-blue-600 text-white border-blue-600 shadow-md scale-105"
                          : "bg-white text-gray-700 border-gray-300 hover:border-blue-500 hover:text-blue-600 hover:shadow"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="h-10 px-4 rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                  >
                    <span className="hidden sm:inline">Sau</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}