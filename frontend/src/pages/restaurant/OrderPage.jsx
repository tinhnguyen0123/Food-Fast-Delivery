import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { 
  Package, 
  Clock, 
  ShoppingBag, 
  Truck, 
  CheckCircle, 
  XCircle,
  MapPin,
  DollarSign,
  Calendar,
  User,
  ChevronRight
} from "lucide-react";

const TABS = [
  { key: "all", label: "Tất cả", icon: Package, color: "blue" },
  { key: "pending", label: "Chờ xử lý", icon: Clock, color: "yellow" },
  { key: "preparing", label: "Đang chuẩn bị", icon: ShoppingBag, color: "blue" },
  { key: "delivering", label: "Đang giao", icon: Truck, color: "purple" },
  { key: "completed", label: "Đã giao", icon: CheckCircle, color: "green" },
  { key: "cancelled", label: "Đã hủy", icon: XCircle, color: "red" },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [restaurantId, setRestaurantId] = useState(localStorage.getItem("myRestaurantId") || "");
  const token = localStorage.getItem("token");

  const ensureRestaurantId = async () => {
    if (restaurantId) return restaurantId;
    const cached = localStorage.getItem("myRestaurantId");
    if (cached) {
      setRestaurantId(cached);
      return cached;
    }
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user?.id && !user?._id) throw new Error("Chưa đăng nhập");
      const res = await fetch(`http://localhost:5000/api/restaurant/owner/${user.id || user._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const list = await res.json();
      if (!res.ok) throw new Error(list.message || "Không lấy được nhà hàng của bạn");
      if (!Array.isArray(list) || list.length === 0) {
        toast.info("Tài khoản chưa có nhà hàng (chưa đăng ký hoặc chưa được duyệt).");
        return "";
      }
      const rid = list[0]._id;
      setRestaurantId(rid);
      localStorage.setItem("myRestaurantId", rid);
      return rid;
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Lỗi lấy thông tin nhà hàng");
      return "";
    }
  };

  const loadOrders = async () => {
    setLoading(true);
    try {
      const rid = await ensureRestaurantId();
      if (!rid) {
        setOrders([]);
        return;
      }
      const res = await fetch(`http://localhost:5000/api/order/restaurant/${rid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Tải đơn hàng thất bại");
      setOrders(Array.isArray(data) ? data : data.orders || []);
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Lỗi tải đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const statusCounts = useMemo(
    () =>
      orders.reduce(
        (acc, o) => {
          acc[o.status] = (acc[o.status] || 0) + 1;
          acc.all++;
          return acc;
        },
        { all: 0 }
      ),
    [orders]
  );

  const ordersToShow = tab === "all" ? orders : orders.filter((o) => o.status === tab);

  // ✅ Xác nhận đơn hàng (pending → preparing)
  const confirmOrder = async (orderId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/order/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "preparing" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Xác nhận đơn thất bại");
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status: "preparing" } : o)));
      toast.success(" Đã xác nhận đơn hàng");
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Lỗi xác nhận đơn");
    }
  };

  // ✅ Sẵn sàng giao (preparing → preparing - đánh dấu sẵn sàng cho drone)
  const markReady = async (orderId) => {
    try {
      // Giữ nguyên status "preparing" nhưng có thể thêm field isReady = true nếu cần
      // Hiện tại chỉ cần đảm bảo status = "preparing" để drone có thể nhận
      toast.success("✅ Đơn hàng đã sẵn sàng cho drone nhận");
      // Không cần gọi API nếu chỉ là thông báo
    } catch (e) {
      console.error(e);
      toast.error("Lỗi đánh dấu sẵn sàng");
    }
  };

  // ✅ Hủy đơn hàng
  const cancelOrder = async (orderId) => {
    if (!window.confirm("Bạn có chắc muốn hủy đơn hàng này?")) return;
    
    try {
      const res = await fetch(`http://localhost:5000/api/order/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "cancelled" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Hủy đơn thất bại");
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status: "cancelled" } : o)));
      toast.success(" Đã hủy đơn hàng");
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Lỗi hủy đơn");
    }
  };

  // ✅ Cập nhật trạng thái thủ công
  const updateStatus = async (orderId, status) => {
    try {
      const res = await fetch(`http://localhost:5000/api/order/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Cập nhật trạng thái thất bại");
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status } : o)));
      toast.success("✅ Đã cập nhật trạng thái");
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Lỗi cập nhật trạng thái");
    }
  };

  // Helper functions
  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Clock, text: "Chờ xử lý" },
      preparing: { color: "bg-blue-100 text-blue-700 border-blue-200", icon: ShoppingBag, text: "Đang chuẩn bị" },
      delivering: { color: "bg-purple-100 text-purple-700 border-purple-200", icon: Truck, text: "Đang giao" },
      completed: { color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle, text: "Đã giao" },
      cancelled: { color: "bg-red-100 text-red-700 border-red-200", icon: XCircle, text: "Đã hủy" },
    };
    return badges[status] || badges.pending;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Đang tải đơn hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý đơn hàng</h1>
          <p className="text-gray-600 mt-1">Theo dõi và xử lý đơn hàng của nhà hàng</p>
        </div>
        <button 
          onClick={loadOrders} 
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          🔄 Tải lại
        </button>
      </div>

      {/* Status Tabs */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {TABS.map((t) => {
            const Icon = t.icon;
            const isActive = tab === t.key;
            const count = statusCounts[t.key] || 0;
            
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  isActive ? "bg-white/20" : "bg-gray-200"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders List */}
      {ordersToShow.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Không có đơn hàng</h3>
          <p className="text-gray-600">
            {tab === "all" 
              ? "Chưa có đơn hàng nào" 
              : `Không có đơn hàng ở trạng thái "${TABS.find(t => t.key === tab)?.label}"`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {ordersToShow.map((order) => {
            const badge = getStatusBadge(order.status);
            const BadgeIcon = badge.icon;
            
            return (
              <div
                key={order._id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden"
              >
                {/* Order Header */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 border-b">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">
                          Đơn #{order._id.slice(-8)}
                        </h3>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(order.createdAt).toLocaleString("vi-VN")}
                        </p>
                      </div>
                    </div>
                    
                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border-2 ${badge.color}`}>
                      <BadgeIcon className="w-4 h-4" />
                      {badge.text}
                    </span>
                  </div>
                </div>

                {/* Order Body */}
                <div className="p-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                    {/* Customer Info */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-600" />
                        Thông tin khách hàng
                      </h4>
                      <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                        <p className="text-sm">
                          <span className="font-medium text-gray-700">Tên:</span>{" "}
                          <span className="text-gray-600">{order.userId?.name || "Khách hàng"}</span>
                        </p>
                        <p className="text-sm">
                          <span className="font-medium text-gray-700">Email:</span>{" "}
                          <span className="text-gray-600">{order.userId?.email || "N/A"}</span>
                        </p>
                        {order.shippingAddress?.text && (
                          <p className="text-sm flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-600">{order.shippingAddress.text}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-orange-600" />
                        Chi tiết món ({order.items?.length || 0})
                      </h4>
                      <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto">
                        <ul className="space-y-2">
                          {(order.items || []).map((item, idx) => (
                            <li key={idx} className="flex justify-between items-center text-sm">
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">
                                  {item.quantity}
                                </span>
                                <span className="font-medium text-gray-700">
                                  {item.productId?.name || item.name || "Món"}
                                </span>
                              </div>
                              <span className="font-semibold text-blue-600">
                                {Intl.NumberFormat("vi-VN").format(
                                  (item.priceAtOrderTime || item.price || 0) * (item.quantity || 1)
                                )}đ
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Total Price */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-800 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        Tổng tiền
                      </span>
                      <span className="text-2xl font-bold text-green-600">
                        {Intl.NumberFormat("vi-VN").format(order.totalPrice || 0)}đ
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {/* Nút cho đơn hàng "Chờ xử lý" */}
                    {order.status === "pending" && (
                      <>
                        <button
                          onClick={() => confirmOrder(order._id)}
                          className="flex-1 sm:flex-none bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-5 h-5" />
                          Xác nhận đơn
                        </button>
                        
                        <button
                          onClick={() => markReady(order._id)}
                          className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                          <Truck className="w-5 h-5" />
                          Sẵn sàng
                        </button>
                        
                        <button
                          onClick={() => cancelOrder(order._id)}
                          className="flex-1 sm:flex-none bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                          <XCircle className="w-5 h-5" />
                          Hủy đơn
                        </button>
                      </>
                    )}

                    {/* Nút chuyển trạng thái khác (cho các trạng thái không phải pending) */}
                    {order.status !== "pending" && order.status !== "completed" && order.status !== "cancelled" && (
                      <div className="flex flex-wrap gap-2 w-full">
                        {order.status === "preparing" && (
                          <button
                            onClick={() => updateStatus(order._id, "delivering")}
                            className="flex-1 sm:flex-none bg-purple-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
                          >
                            <Truck className="w-5 h-5" />
                            Bắt đầu giao
                          </button>
                        )}
                        
                        {order.status === "delivering" && (
                          <button
                            onClick={() => updateStatus(order._id, "completed")}
                            className="flex-1 sm:flex-none bg-green-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                          >
                            <CheckCircle className="w-5 h-5" />
                            Hoàn thành
                          </button>
                        )}

                        {(order.status === "preparing" || order.status === "delivering") && (
                          <button
                            onClick={() => cancelOrder(order._id)}
                            className="flex-1 sm:flex-none bg-red-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                          >
                            <XCircle className="w-5 h-5" />
                            Hủy đơn
                          </button>
                        )}
                      </div>
                    )}

                    {/* Hiển thị thông báo cho đơn đã hoàn thành hoặc đã hủy */}
                    {(order.status === "completed" || order.status === "cancelled") && (
                      <div className={`w-full text-center py-2 rounded-lg font-medium ${
                        order.status === "completed" 
                          ? "bg-green-100 text-green-700" 
                          : "bg-red-100 text-red-700"
                      }`}>
                        {order.status === "completed" ? "✅ Đơn hàng đã hoàn thành" : "❌ Đơn hàng đã bị hủy"}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}