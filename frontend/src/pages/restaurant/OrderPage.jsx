import { useEffect, useMemo, useState, useRef } from "react"; // Thêm useRef
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
  Info,
  Navigation, // Thêm icon
} from "lucide-react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap,
  Popup,
} from "react-leaflet"; // Thêm import react-leaflet
import L from "leaflet"; // Thêm import leaflet
import "leaflet/dist/leaflet.css"; // Thêm import CSS leaflet
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
// --- Cài đặt icon cho Leaflet ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });
const restaurantIcon = L.divIcon({ className: "text-3xl", html: "🏠" });
const customerIcon = L.divIcon({ className: "text-3xl", html: "📍" });
const droneIcon = L.divIcon({ className: "text-2xl", html: "🚁" });
// TABS và API_BASE giữ nguyên
const TABS = [
  { key: "all", label: "Tất cả", icon: Package, color: "blue" },
  { key: "pending", label: "Chờ xử lý", icon: Clock, color: "yellow" },
  { key: "preparing", label: "Đang chuẩn bị", icon: ShoppingBag, color: "blue" },
  { key: "ready", label: "Sẵn sàng", icon: Truck, color: "purple" },
  { key: "delivering", label: "Đang giao", icon: Truck, color: "purple" },
  { key: "completed", label: "Đã giao", icon: CheckCircle, color: "green" },
  { key: "cancelled", label: "Đã hủy", icon: XCircle, color: "red" },
];
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
// (Toàn bộ logic: ensureRestaurantId, loadOrders, statusCounts, ... giữ nguyên)
// ... (Phần logic từ code của bạn) ...
// ===============================================
// BẮT ĐẦU PHẦN COMPONENT CHÍNH
// ===============================================
export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [restaurantId, setRestaurantId] = useState(localStorage.getItem("myRestaurantId") || "");
  const token = localStorage.getItem("token");
  // === TRẠNG THÁI MỚI ===
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingOrder, setTrackingOrder] = useState(null); // ✅ State cho modal theo dõi
  // (Toàn bộ logic: ensureRestaurantId, loadOrders, ... giữ nguyên)
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
      const res = await fetch(`${API_BASE}/api/restaurant/owner/${user.id || user._id}`, {
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
      const res = await fetch(`${API_BASE}/api/order/restaurant/${rid}`, {
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
  const ordersToShow = useMemo(
    () => (tab === "all" ? orders : orders.filter((o) => o.status === tab)),
    [orders, tab]
  );
  useEffect(() => {
    if (selectedOrder && !ordersToShow.find((o) => o._id === selectedOrder._id)) {
      setSelectedOrder(null);
    }
  }, [ordersToShow, selectedOrder]);
  // (Toàn bộ logic: confirmOrder, markReady, startDelivery, cancelOrder, getStatusBadge... giữ nguyên)
  const confirmOrder = async (orderId) => {
    try {
      const res = await fetch(`${API_BASE}/api/order/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "preparing" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Lỗi xác nhận đơn");
      const updatedOrder = data.order && data.order._id
        ? {
            ...data.order,
            userId: data.order.userId || selectedOrder?.userId
          }
        : { ...selectedOrder, status: "preparing" };
      setOrders((prev) => prev.map((o) => (o._id === orderId ? updatedOrder : o)));
      if (selectedOrder?._id === orderId) setSelectedOrder(updatedOrder);
     
      toast.success("Đã xác nhận đơn hàng");
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Lỗi xác nhận đơn");
    }
  };
  const markReady = async (orderId) => {
    try {
      const res = await fetch(`${API_BASE}/api/order/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "ready" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Lỗi đánh dấu sẵn sàng");
      const updatedOrder = data.order && data.order._id
        ? {
            ...data.order,
            userId: data.order.userId || selectedOrder?.userId
          }
        : { ...selectedOrder, status: "ready" };
      setOrders((prev) => prev.map((o) => (o._id === orderId ? updatedOrder : o)));
      if (selectedOrder?._id === orderId) setSelectedOrder(updatedOrder);
     
      toast.success("Đơn đã sẵn sàng");
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Lỗi cập nhật trạng thái");
    }
  };
  const startDelivery = async (order) => {
    try {
      if (!order.deliveryId) {
        toast.error("Đơn chưa được gán drone. Vui lòng gán drone trước.");
        return;
      }
      const res = await fetch(`${API_BASE}/api/drone/start-delivery`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ deliveryId: order.deliveryId }),
      });
      const text = await res.text();
      let data = {};
      try { data = text ? JSON.parse(text) : {}; } catch { data = {}; }
      if (!res.ok) {
        throw new Error(data.message || `Không thể bắt đầu giao (HTTP ${res.status})`);
      }
      const updatedOrder = data.order && data.order._id
        ? data.order
        : { ...order, status: "delivering" };
      setOrders((prev) => prev.map((o) => (o._id === order._id ? updatedOrder : o)));
      if (selectedOrder?._id === order._id) setSelectedOrder(updatedOrder);
      toast.success("Đã bắt đầu giao");
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Lỗi bắt đầu giao");
    }
  };
  const cancelOrder = async (orderId) => {
  if (!window.confirm("Bạn có chắc muốn hủy đơn hàng này?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/order/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "cancelled" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Hủy đơn thất bại");
      const updatedOrder = { ...data, status: "cancelled" };
      setOrders((prev) => prev.map((o) => (o._id === orderId ? updatedOrder : o)));
      if (selectedOrder?._id === orderId) setSelectedOrder(updatedOrder);
      toast.success("Đã hủy đơn hàng");
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Lỗi hủy đơn");
    }
  };
  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Clock, text: "Chờ xử lý" },
      preparing: { color: "bg-blue-100 text-blue-700 border-blue-200", icon: ShoppingBag, text: "Đang chuẩn bị" },
      ready: { color: "bg-purple-100 text-purple-700 border-purple-200", icon: Truck, text: "Sẵn sàng" },
      delivering: { color: "bg-purple-100 text-purple-700 border-purple-200", icon: Truck, text: "Đang giao" },
      completed: { color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle, text: "Đã giao" },
      cancelled: { color: "bg-red-100 text-red-700 border-red-200", icon: XCircle, text: "Đã hủy" },
    };
    return badges[status] || badges.pending;
  };
  // ...
  // Loading state giữ nguyên
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
  // ===============================================
  // GIAO DIỆN
  // ===============================================
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Quản lý đơn hàng</h1>
          <p className="text-sm text-gray-600 mt-1">Theo dõi và xử lý đơn hàng của nhà hàng</p>
        </div>
        <button
          onClick={loadOrders}
          className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-sm"
        >
          🔄 Tải lại
        </button>
      </div>
      {/* Status Tabs */}
      <div className="bg-white rounded-md shadow-md p-2">
        <div className="flex gap-1 overflow-x-auto pb-1">
          {TABS.map((t) => {
            const Icon = t.icon;
            const isActive = tab === t.key;
            const count = statusCounts[t.key] || 0;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-all text-sm ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{t.label}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-xs ${isActive ? "bg-white/20" : "bg-gray-200"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      {/* === BỐ CỤC MASTER-DETAIL === */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* --- CỘT BÊN TRÁI: DANH SÁCH ĐƠN HÀNG --- */}
        <div className="lg:col-span-1">
          {ordersToShow.length === 0 ? (
            <div className="bg-white rounded-md shadow-md p-8 text-center">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-800 mb-1">Không có đơn hàng</h3>
              <p className="text-sm text-gray-600">
                {tab === "all"
                  ? "Chưa có đơn hàng nào"
                  : `Không có đơn hàng ở trạng thái "${TABS.find((t) => t.key === tab)?.label}"`}
              </p>
            </div>
          ) : (
            <div className="space-y-2 lg:max-h-[calc(100vh-200px)] lg:overflow-y-auto pr-1">
              {ordersToShow.map((order) => (
                <OrderSummaryCard
                  key={order._id}
                  order={order}
                  isSelected={selectedOrder?._id === order._id}
                  onSelect={() => setSelectedOrder(order)}
                  getStatusBadge={getStatusBadge}
                />
              ))}
            </div>
          )}
        </div>
        {/* --- CỘT BÊN PHẢI: CHI TIẾT ĐƠN HÀNG --- */}
        <div className="lg:col-span-2">
          {selectedOrder ? (
            <OrderDetailView
              order={selectedOrder}
              getStatusBadge={getStatusBadge}
              onConfirm={confirmOrder}
              onReady={markReady}
              onStartDelivery={startDelivery}
              onCancel={cancelOrder}
              onTrackDrone={() => setTrackingOrder(selectedOrder)} // ✅ Prop để mở modal
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-white rounded-md shadow-md p-8 text-center">
              <div>
                <Info className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Chưa chọn đơn hàng</h3>
                <p className="text-sm text-gray-600">Vui lòng chọn một đơn hàng từ danh sách bên trái để xem chi tiết.</p>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* ✅ Modal theo dõi drone */}
      {trackingOrder && (
        <DroneTrackingModal
          order={trackingOrder}
          onClose={() => setTrackingOrder(null)}
        />
      )}
    </div>
  );
}
// ===============================================
// COMPONENT: THẺ TÓM TẮT ĐƠN HÀNG
// ===============================================
function OrderSummaryCard({ order, isSelected, onSelect, getStatusBadge }) {
  const badge = getStatusBadge(order.status);
  const BadgeIcon = badge.icon;
  const statusColor = {
    pending: "border-yellow-500",
    preparing: "border-blue-500",
    ready: "border-purple-500",
    delivering: "border-purple-500",
    completed: "border-green-500",
    cancelled: "border-red-500",
  };
  return (
    <button
      onClick={onSelect}
      className={`w-full p-3 bg-white rounded-md shadow-md hover:shadow-lg transition-all text-left border-l-4 ${
        statusColor[order.status] || "border-gray-500"
      } ${isSelected ? "ring-2 ring-blue-500 shadow-lg" : ""}`}
    >
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-base font-bold text-gray-800">Đơn #{order._id.slice(-8)}</h3>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${badge.color}`}>
          <BadgeIcon className="w-3 h-3" />
          {badge.text}
        </span>
      </div>
      <p className="text-xs text-gray-600 mb-1">
        {order.userId?.name || "Khách hàng"}
      </p>
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500">
          {new Date(order.createdAt).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
        <span className="text-base font-bold text-green-600">
          {Intl.NumberFormat("vi-VN").format(order.totalPrice || 0)}đ
        </span>
      </div>
    </button>
  );
}
// ===============================================
// COMPONENT: CHI TIẾT ĐƠN HÀNG
// ===============================================
function OrderDetailView({ order, getStatusBadge, onConfirm, onReady, onStartDelivery, onCancel, onTrackDrone }) { // Thêm onTrackDrone
  const badge = getStatusBadge(order.status);
  const BadgeIcon = badge.icon;
  return (
    <div className="bg-white rounded-md shadow-md overflow-hidden">
      {/* Order Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 border-b">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-md flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-800">
                Đơn #{order._id.slice(-8)}
              </h3>
              <p className="text-xs text-gray-600 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(order.createdAt).toLocaleString("vi-VN")}
              </p>
            </div>
          </div>
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${badge.color}`}>
            <BadgeIcon className="w-3 h-3" />
            {badge.text}
          </span>
        </div>
      </div>
      {/* Order Body */}
      <div className="p-3">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
          {/* Customer Info */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-gray-800 flex items-center gap-1">
              <User className="w-4 h-4 text-blue-600" />
              Thông tin khách hàng
            </h4>
            <div className="bg-gray-50 rounded-md p-2 space-y-1 text-xs">
              <p>
                <span className="font-medium text-gray-700">Tên:</span>{" "}
                <span className="text-gray-600">{order.userId?.name || "Khách hàng"}</span>
              </p>
              <p>
                <span className="font-medium text-gray-700">Email:</span>{" "}
                <span className="text-gray-600">{order.userId?.email || "N/A"}</span>
              </p>
              {order.shippingAddress?.text && (
                <p className="flex items-start gap-1">
                  <MapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">{order.shippingAddress.text}</span>
                </p>
              )}
            </div>
          </div>
          {/* Order Items */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-gray-800 flex items-center gap-1">
              <ShoppingBag className="w-4 h-4 text-orange-600" />
              Chi tiết món ({order.items?.length || 0})
            </h4>
            <div className="bg-gray-50 rounded-md p-2 max-h-32 overflow-y-auto text-xs">
              <ul className="space-y-1">
                {(order.items || []).map((item, idx) => (
                  <li key={idx} className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">
                        {item.quantity}
                      </span>
                      <span className="font-medium text-gray-700">
                        {item.productId?.name || item.name || "Món"}
                      </span>
                    </div>
                    <span className="font-semibold text-blue-600">
                      {Intl.NumberFormat("vi-VN").format(
                        (item.priceAtOrderTime || item.price || 0) * (item.quantity || 1)
                      )}
                      đ
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        {/* Total Price */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-md p-2 mb-3">
          <div className="flex justify-between items-center text-sm">
            <span className="font-semibold text-gray-800 flex items-center gap-1">
              <DollarSign className="w-4 h-4 text-green-600" />
              Tổng tiền
            </span>
            <span className="text-xl font-bold text-green-600">
              {Intl.NumberFormat("vi-VN").format(order.totalPrice || 0)}đ
            </span>
          </div>
        </div>
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {order.status === "pending" && (
            <button onClick={() => onConfirm(order._id)} className="flex-1 sm:flex-none bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-md font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-1 text-sm">
              <CheckCircle className="w-4 h-4" /> Xác nhận đơn
            </button>
          )}
          {order.status === "preparing" && (
            <button onClick={() => onReady(order._id)} className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-md font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-1 text-sm">
              <Truck className="w-4 h-4" /> Sẵn sàng
            </button>
          )}
          {order.status === "ready" &&
            (order.deliveryId ? (
              <button onClick={() => onStartDelivery(order)} className="flex-1 sm:flex-none bg-purple-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-purple-700 transition-all flex items-center justify-center gap-1 text-sm">
                <Truck className="w-4 h-4" /> Bắt đầu giao
              </button>
            ) : (
              <span className="text-xs text-gray-600 bg-gray-100 px-3 py-2 rounded-md">
                Đơn đã sẵn sàng. Vui lòng qua trang Drone để gán drone.
              </span>
            ))}
         
          {/* Nút hủy */}
          {(order.status === "pending" || order.status === "preparing") && (
             <button onClick={() => onCancel(order._id)} className="flex-1 sm:flex-none bg-red-100 text-red-600 px-4 py-2 rounded-md font-semibold hover:bg-red-200 transition-all flex items-center justify-center gap-1 text-sm">
               <XCircle className="w-4 h-4" /> Hủy đơn
            </button>
          )}
          {/* ✅ Nút theo dõi drone (THÊM MỚI) */}
          {(order.status === "delivering" || order.status === "completed") && order.deliveryId && (
             <button onClick={onTrackDrone} className="flex-1 sm:flex-none bg-teal-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-teal-600 transition-all flex items-center justify-center gap-1 text-sm">
               <Navigation className="w-4 h-4" /> Theo dõi Drone
            </button>
          )}
          {/* Trạng thái Hoàn thành/Đã hủy */}
          {(order.status === "completed" || order.status === "cancelled") && (
            <div className={`w-full text-center py-2 rounded-md font-medium text-sm ${order.status === "completed" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {order.status === "completed" ? "✅ Đơn hàng đã hoàn thành" : "❌ Đơn hàng đã bị hủy"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
// ===============================================
// COMPONENT MỚI: MODAL THEO DÕI DRONE
// ===============================================
function DroneTrackingModal({ order, onClose }) {
  const [delivery, setDelivery] = useState(null);
  const [dronePos, setDronePos] = useState(null);
  const [loading, setLoading] = useState(true);
  const pollTimerRef = useRef(null);
  const restaurantCoords = order.restaurantId?.locationId?.coords;
  const customerCoords = order.shippingAddress?.location;
  useEffect(() => {
    let mounted = true;
    const pollDelivery = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/api/delivery/order/${order._id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!mounted) return;
        if (res.ok) {
          const data = await res.json();
          setDelivery(data);
          setDronePos(data?.droneId?.currentLocationId?.coords || null);
        }
      } catch (e) {
        console.error("Poll delivery error:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    pollDelivery();
    pollTimerRef.current = setInterval(pollDelivery, 3000); // Cập nhật mỗi 3s
    return () => {
      mounted = false;
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
      }
    };
  }, [order._id]);
  const route = useMemo(() => {
    if (!restaurantCoords || !customerCoords) return [];
    const path = [];
    // Tạo đường thẳng đơn giản
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      path.push([
        restaurantCoords.lat + (customerCoords.lat - restaurantCoords.lat) * t,
        restaurantCoords.lng + (customerCoords.lng - restaurantCoords.lng) * t,
      ]);
    }
    return path;
  }, [restaurantCoords, customerCoords]);
  const droneStatus = delivery?.droneId?.status;
  const statusMessage =
    droneStatus === "returning"
      ? "Drone đang quay về nhà hàng."
      : droneStatus === "delivering"
      ? "Drone đang trên đường giao hàng."
      : delivery?.status === "arrived"
      ? "Drone đã đến nơi. Chờ khách xác nhận."
      : delivery?.status === "completed"
      ? "Giao hàng hoàn tất. Drone đã hoặc đang quay về."
      : "Đang tải dữ liệu vị trí drone...";
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Theo dõi đơn hàng #{order._id.slice(-6)}</h2>
            <p className="text-sm text-gray-600">{statusMessage}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <XCircle className="w-6 h-6 text-gray-500" />
          </button>
        </div>
        <div className="flex-grow relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <p>Đang tải bản đồ...</p>
            </div>
          ) : (
            <MapContainer
              // Sử dụng tọa độ nhà hàng làm trung tâm, fallback về một vị trí mặc định
              center={[restaurantCoords?.lat || 10.76023329529749, restaurantCoords?.lng ||  106.68225829558169]}
              zoom={14}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {restaurantCoords && (
                <Marker position={[restaurantCoords.lat, restaurantCoords.lng]} icon={restaurantIcon}>
                  <Popup>Nhà hàng của bạn</Popup>
                </Marker>
              )}
              {customerCoords && (
                <Marker position={[customerCoords.lat, customerCoords.lng]} icon={customerIcon}>
                  <Popup>Địa chỉ khách hàng</Popup>
                </Marker>
              )}
              {dronePos && (
                <Marker position={[dronePos.lat, dronePos.lng]} icon={droneIcon}>
                  <Popup>Vị trí Drone</Popup>
                </Marker>
              )}
              {route.length > 0 && <Polyline positions={route} color="#8b5cf6" weight={4} dashArray="5,5" />}
            </MapContainer>
          )}
        </div>
      </div>
    </div>
  );
}