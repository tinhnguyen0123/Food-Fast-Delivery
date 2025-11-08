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
  ChevronRight
} from "lucide-react";

export default function OrdersPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [refreshFlag, setRefreshFlag] = useState(0);

  useEffect(() => {
    const wanted = location.state?.status;
    if (wanted) setSelectedStatus(wanted);
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, refreshFlag]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "null");

      if (!token || !user) {
        console.warn("No token/user when loading orders");
        navigate("/login");
        return;
      }

      const res = await fetch(`http://localhost:5000/api/order/user/${user.id || user._id}`, {
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

  const statusCounts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  const tabs = [
    { 
      key: "all", 
      label: "Tất cả", 
      icon: Package,
      color: "gray"
    },
    { 
      key: "pending", 
      label: "Chờ xử lý", 
      icon: Clock,
      color: "yellow"
    },
    { 
      key: "preparing", 
      label: "Đang chuẩn bị", 
      icon: ShoppingBag,
      color: "blue"
    },
    { 
      key: "delivering", 
      label: "Đang giao", 
      icon: Truck,
      color: "purple"
    },
    { 
      key: "completed", 
      label: "Đã giao", 
      icon: CheckCircle,
      color: "green"
    },
    { 
      key: "cancelled", 
      label: "Đã hủy", 
      icon: XCircle,
      color: "red"
    },
  ];

  const ordersToShow =
    selectedStatus === "all"
      ? orders
      : orders.filter((o) => o.status === selectedStatus);

  const cancelOrderById = async (orderId) => {
    if (!orderId) return;
    if (!window.confirm("Bạn có chắc muốn hủy đơn này?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/order/${orderId}`, {
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

  // Helper function để lấy màu theo status
  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      preparing: "bg-blue-100 text-blue-800 border-blue-200",
      delivering: "bg-purple-100 text-purple-800 border-purple-200",
      completed: "bg-green-100 text-green-800 border-green-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  // Helper function để lấy text hiển thị
  const getStatusText = (status) => {
    const texts = {
      pending: "Chờ xử lý",
      preparing: "Đang chuẩn bị",
      delivering: "Đang giao",
      completed: "Đã giao",
      cancelled: "Đã hủy",
    };
    return texts[status] || status;
  };

  const EmptyStatusView = ({ statusKey }) => (
    <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Package className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        Không có đơn hàng
      </h3>
      <p className="text-gray-600 mb-6">
        Không có đơn hàng nào ở trạng thái "
        {tabs.find((t) => t.key === statusKey)?.label || statusKey}"
      </p>
      <button
        onClick={() => navigate("/products")}
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 inline-flex items-center gap-2"
      >
        <ShoppingBag className="w-5 h-5" />
        Đặt hàng ngay
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Đang tải đơn hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Đơn hàng của bạn
          </h1>
          <p className="text-gray-600">Theo dõi và quản lý đơn hàng của bạn</p>
        </div>

        {/* Status Tabs */}
        <div className="mb-8 bg-white rounded-2xl shadow-lg p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = selectedStatus === tab.key;
              const count = tab.key === "all" ? orders.length : (statusCounts[tab.key] || 0);
              
              return (
                <button
                  key={tab.key}
                  onClick={() => setSelectedStatus(tab.key)}
                  className={`relative p-4 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Icon className={`w-6 h-6 ${isActive ? "text-white" : `text-${tab.color}-600`}`} />
                    <span className="text-sm font-semibold">{tab.label}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      isActive ? "bg-white/20" : "bg-gray-200"
                    }`}>
                      {count}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Orders List */}
        {ordersToShow.length === 0 ? (
          <EmptyStatusView statusKey={selectedStatus} />
        ) : (
          <div className="space-y-4">
            {ordersToShow.map((order) => (
              <div
                key={order._id}
                onClick={() => navigate(`/orders/${order._id}`)}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group"
              >
                {/* Header với gradient */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
                  <div className="flex justify-between items-start text-white">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Package className="w-5 h-5" />
                        <span className="font-semibold">Đơn #{order._id.slice(-8)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-white/80">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(order.createdAt).toLocaleDateString("vi-VN")}</span>
                      </div>
                    </div>
                    
                    <span className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6">
                  {/* Items List */}
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-blue-600" />
                      Chi tiết món ({order.items.length})
                    </h3>
                    <div className="space-y-2">
                      {order.items.map((it) => (
                        <div
                          key={it.productId._id || it.productId}
                          className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                              <span className="text-2xl">🍔</span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-800">{it.productId.name}</div>
                              <div className="text-sm text-gray-500">
                                {Number(it.productId.price || 0).toLocaleString("vi-VN")}₫
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600">x{it.quantity}</div>
                            <div className="font-semibold text-blue-600">
                              {(Number(it.productId.price || 0) * it.quantity).toLocaleString("vi-VN")}₫
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 text-gray-600">
                        <DollarSign className="w-5 h-5" />
                        <span className="text-sm">
                          {order.paymentMethod === "COD"
                            ? "Thanh toán khi nhận hàng"
                            : "Đã thanh toán"}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Tổng tiền</div>
                          <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                            {order.totalPrice?.toLocaleString("vi-VN")}₫
                          </div>
                        </div>
                        
                        {(order.status === "pending" || order.status === "preparing") && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              cancelOrderById(order._id);
                            }}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold flex items-center gap-2"
                          >
                            <XCircle className="w-4 h-4" />
                            Hủy đơn
                          </button>
                        )}
                        
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </div>
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