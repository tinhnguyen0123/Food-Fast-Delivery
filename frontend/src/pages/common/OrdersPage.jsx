import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Package,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  ShoppingBag,
  Calendar,
  DollarSign,
  ChevronRight,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function OrdersPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [refreshFlag, setRefreshFlag] = useState(0);

  const token = localStorage.getItem("token");

  // ... (TOÀN BỘ LOGIC: loadOrders, cancelOrderById, getStatusColor, v.v...)
  // ... (KHÔNG THAY ĐỔI BẤT CỨ HÀM NÀO Ở ĐÂY)

  useEffect(() => {
    const wanted = location.state?.status;
    if (wanted) setSelectedStatus(wanted);
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, refreshFlag]);

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


  const statusCounts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  const tabs = [
    { key: "all", label: "Tất cả", icon: Package, color: "gray" },
    { key: "pending", label: "Chờ xử lý", icon: Clock, color: "yellow" },
    { key: "preparing", label: "Đang chuẩn bị", icon: ShoppingBag, color: "blue" },
    { key: "delivering", label: "Đang giao", icon: Truck, color: "purple" },
    { key: "completed", label: "Đã giao", icon: CheckCircle, color: "green" },
    { key: "cancelled", label: "Đã hủy", icon: XCircle, color: "red" },
  ];

  const ordersToShow =
    selectedStatus === "all"
      ? orders
      : orders.filter((o) => o.status === selectedStatus);

  const getStatusColor = (status) => {
    // Tinh chỉnh màu cho phù hợp với badge
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      preparing: "bg-blue-100 text-blue-800",
      ready: "bg-purple-100 text-purple-800",
      delivering: "bg-purple-100 text-purple-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusText = (status) => {
    const texts = {
      pending: "Chờ xử lý",
      preparing: "Đang chuẩn bị",
      ready: "Đang chuẩn bị",
      delivering: "Đang giao",
      completed: "Đã giao",
      cancelled: "Đã hủy",
    };
    return texts[status] || status;
  };

  const EmptyStatusView = ({ statusKey }) => (
    // 4. Tinh chỉnh Thẻ "Trống"
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
      {/* 5. Đổi nút gradient sang nút đặc (solid) */}
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
      // 1. Đổi nền loading
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Đang tải đơn hàng...</p>
        </div>
      </div>
    );
  }

  return (
    // 1. Đổi nền gradient sang xám nhạt
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          {/* 2. Đổi tiêu đề gradient sang chữ đặc */}
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Đơn hàng của bạn
          </h1>
          <p className="text-lg text-gray-700">Theo dõi và quản lý đơn hàng của bạn</p>
        </div>

        {/* 3. Tabs (Thiết kế lại hoàn toàn) */}
        <div className="mb-8 bg-white rounded-xl shadow-md p-2">
          {/* Dùng flex-wrap để tự động xuống hàng trên mobile */}
          <div className="flex flex-wrap items-center">
            {tabs.map((tab) => {
              const isActive = selectedStatus === tab.key;
              const count =
                tab.key === "all" ? orders.length : statusCounts[tab.key] || 0;

              return (
                <button
                  key={tab.key}
                  onClick={() => setSelectedStatus(tab.key)}
                  // Chuyển sang kiểu gạch chân (underline)
                  className={`flex-auto px-4 py-3 rounded-lg text-center font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  {tab.label}
                  {/* Badge đếm số lượng */}
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                      isActive ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Orders list */}
        {ordersToShow.length === 0 ? (
          <EmptyStatusView statusKey={selectedStatus} />
        ) : (
          <div className="space-y-4">
            {ordersToShow.map((order) => (
              // 4. Cấu trúc lại thẻ (card) đơn hàng
              <div
                key={order._id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group"
              >
                {/* 4a. Header của thẻ */}
                <div className="p-4 border-b border-gray-200 bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <span className="font-semibold text-gray-800">
                      Đơn hàng #{order._id.slice(-8)}
                    </span>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Ngày đặt: {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`mt-2 sm:mt-0 px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {getStatusText(order.status)}
                  </span>
                </div>

                {/* 4b. Body của thẻ (Danh sách sản phẩm) */}
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => navigate(`/orders/${order._id}`)}
                >
                  <div className="space-y-3">
                    {/* Chỉ hiển thị 1-2 món, còn lại ẩn đi (cho gọn) */}
                    {order.items.slice(0, 2).map((it) => (
                      <div
                        key={it.productId._id || it.productId}
                        className="flex justify-between items-center"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            {/* Dùng emoji hoặc ảnh nếu có */}
                            <span className="text-2xl">🍔</span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-800">
                              {it.productId.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              Số lượng: {it.quantity}
                            </div>
                          </div>
                        </div>
                        <div className="font-semibold text-gray-800">
                          {(
                            Number(it.productId.price || 0) * it.quantity
                          ).toLocaleString("vi-VN")}
                          ₫
                        </div>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                       <p className="text-sm text-gray-500 text-center">
                         ...và {order.items.length - 2} món khác
                       </p>
                    )}
                  </div>
                </div>

                {/* 4c. Footer của thẻ (Tổng tiền và Nút bấm) */}
                <div className="p-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                       <div className="flex items-center gap-2 text-gray-600">
                        <DollarSign className="w-5 h-5" />
                        <span className="text-sm">
                          {order.paymentMethod === "COD"
                            ? "Thanh toán khi nhận"
                            : "Đã thanh toán"}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-gray-500">Tổng tiền: </span>
                        <span className="text-xl font-bold text-gray-900">
                          {order.totalPrice?.toLocaleString("vi-VN")}₫
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {(order.status === "pending" ||
                        order.status === "preparing") && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Ngăn click vào thẻ cha
                            cancelOrderById(order._id);
                          }}
                          className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors text-sm font-semibold flex items-center gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          Hủy đơn
                        </button>
                      )}
                      {/* 5. Đổi nút "Xem chi tiết" */}
                      <button
                        onClick={() => navigate(`/orders/${order._id}`)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold flex items-center gap-2"
                      >
                        Xem chi tiết
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}