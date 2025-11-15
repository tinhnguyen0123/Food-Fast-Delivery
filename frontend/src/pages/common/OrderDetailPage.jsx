import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Package,
  Calendar,
  MapPin,
  Store,
  DollarSign,
  ShoppingBag,
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  CreditCard,
  Check,
} from "lucide-react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap,
  Popup,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

// --- Leaflet Icon Setup ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

// --- Custom Map Icons ---
const restaurantIcon = L.divIcon({ className: "text-3xl", html: "🏠" });
const customerIcon = L.divIcon({ className: "text-3xl", html: "📍" });
const droneIcon = L.divIcon({ className: "text-2xl", html: "🚁" });

// --- Map Utility Component ---
function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points?.length > 0) {
      try {
        map.fitBounds(points, { padding: [40, 40] });
      } catch {}
    }
  }, [points, map]);
  return null;
}

// --- Status Config ---
const getStatusConfig = (status) => {
  const map = {
    pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock, text: "Chờ xử lý" },
    preparing: { color: "bg-blue-100 text-blue-800", icon: ShoppingBag, text: "Đang chuẩn bị" },
    delivering: { color: "bg-purple-100 text-purple-800", icon: Truck, text: "Đang giao" },
    completed: { color: "bg-green-100 text-green-800", icon: CheckCircle, text: "Đã giao" },
    cancelled: { color: "bg-red-100 text-red-800", icon: XCircle, text: "Đã hủy" },
  };
  return map[status] || map.pending;
};

// --- Main Component ---
export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [dronePos, setDronePos] = useState(null);
  const [routeCoords, setRouteCoords] = useState(null);
  const [hideTracking, setHideTracking] = useState(false);
  const pollTimerRef = useRef(null);

  // Viewer role
  const viewer = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();
  const viewerRole = viewer.role; // customer | restaurant | admin

  // Load order
  useEffect(() => {
    const loadOrder = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/api/order/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error("Không thể tải thông tin đơn hàng");
        const data = await res.json();
        setOrder(data);

        const r = data?.restaurantId?.locationId?.coords;
        const c = data?.shippingAddress?.location;
        if (r?.lat && r?.lng && c?.lat && c?.lng) {
          const steps = 20;
          const path = [];
          for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            path.push([r.lat + (c.lat - r.lat) * t, r.lng + (c.lng - r.lng) * t]);
          }
          setRouteCoords(path);
        }

        if (data.status === "completed") {
          setHideTracking(true);
          if (pollTimerRef.current) {
            clearInterval(pollTimerRef.current);
            pollTimerRef.current = null;
          }
        }
      } catch (e) {
        toast.error(e.message);
      } finally {
        setLoading(false);
      }
    };
    loadOrder();
  }, [id]);

  // Poll delivery
  useEffect(() => {
    if (!id || hideTracking) return;
    let mounted = true;

    const pollDelivery = async () => {
      try {
        const token = localStorage.getItem("token");
        // 1. Gọi API lấy thông tin giao hàng (vị trí drone)
        const deliveryRes = await fetch(`${API_BASE}/api/delivery/order/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        // 2. Gọi API lấy thông tin đơn hàng (để cập nhật status)
        const orderRes = await fetch(`${API_BASE}/api/order/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!mounted) return; // Kiểm tra component còn mounted không
        // 3. Cập nhật state giao hàng
        if (deliveryRes.ok) {
          const deliveryData = await deliveryRes.json();
          setDelivery(deliveryData);
          setDronePos(deliveryData?.droneId?.currentLocationId?.coords || null);
        }
        // 4. Cập nhật state đơn hàng (FIX QUAN TRỌNG NHẤT)
        if (orderRes.ok) {
          const orderData = await orderRes.json();
          setOrder(orderData); // <--- Dòng này sẽ cập nhật lại 'cây trạng thái'
        }
      } catch (e) {
        console.error("Lỗi polling:", e); // Nên thêm log để biết lỗi
      }
    };

    pollDelivery();
    pollTimerRef.current = setInterval(pollDelivery, 3000);

    return () => {
      mounted = false;
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, [id, hideTracking]);

  // Stop polling on completed
  useEffect(() => {
    if (order?.status === "completed") {
      setHideTracking(true);
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    }
  }, [order?.status]);

  const confirmOrderReceived = async () => {
    if (!order || order.status !== "delivering") return;
    if (!window.confirm("Xác nhận bạn đã nhận đơn hàng?")) return;
    try {
      setConfirming(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/order/${order._id}/confirm-completed`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Xác nhận thất bại");
      setOrder((p) => ({ ...p, status: "completed" }));
      setDelivery((p) => (p ? { ...p, status: "completed" } : p));
      setHideTracking(true);
      const list = JSON.parse(localStorage.getItem("notifQueue") || "[]");
      localStorage.setItem(
        "notifQueue",
        JSON.stringify(list.filter((n) => n.orderId !== order._id))
      );
      toast.success("Đã xác nhận hoàn thành đơn hàng");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setConfirming(false);
    }
  };

  // --- Render Loading/Error ---
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p>Đang tải đơn hàng...</p>
      </div>
    );

  if (!order)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p>Không tìm thấy đơn hàng</p>
      </div>
    );

  // --- Data & Configs for Render ---
  const rC = order?.restaurantId?.locationId?.coords;
  const cC = order?.shippingAddress?.location;
  const points = [
    rC && [rC.lat, rC.lng],
    cC && [cC.lat, cC.lng],
    dronePos && [dronePos.lat, dronePos.lng],
  ].filter(Boolean);

  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;

  const statusMessage = (() => {
    if (order?.status === "completed") return "✅ Đơn đã hoàn thành. Cảm ơn bạn!";
    if (!delivery) return "⏳ Đơn hàng chưa được gán drone. Vui lòng chờ nhà hàng xử lý.";
    if (delivery.status === "waiting") return "⏳ Đon hàng đã được gán drone, đang chờ xuất phát.";
    if (delivery.status === "arrived") return "✅ Drone đã giao hàng đến nơi. Vui lòng xác nhận đã nhận hàng.";
    if (dronePos) return "🚁 Drone đang bay đến địa chỉ giao hàng.";
    return "📍 Drone đã nhận đơn nhưng chưa cập nhật vị trí.";
  })();

  const paymentMethodLabel =
    order.paymentMethod === "COD"
      ? "Thanh toán khi nhận hàng"
      : order.paymentMethod === "MOMO"
      ? "Ví MoMo"
      : order.paymentMethod || "Không rõ";

  // --- Status Stepper Config ---
  const allStatuses = [
    { key: "pending", text: "Chờ xử lý", icon: Clock },
    { key: "preparing", text: "Đang chuẩn bị", icon: ShoppingBag },
    { key: "delivering", text: "Đang giao", icon: Truck },
    { key: "completed", text: "Đã giao", icon: CheckCircle },
  ];
  let currentStepIndex = allStatuses.findIndex((s) => s.key === order.status);
  if (order.status === "completed") currentStepIndex = allStatuses.length;
  if (order.status === "cancelled") currentStepIndex = -1;

  // --- JSX ---
  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* 1. Page Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/orders")}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeft className="w-5 h-5" /> Quay lại danh sách
          </button>
          
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                Chi tiết đơn hàng
                <span className="font-mono text-lg text-blue-600">#{order._id.slice(-8)}</span>
              </h1>
              <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
                <Calendar className="w-4 h-4" />
                Ngày tạo: {new Date(order.createdAt).toLocaleString("vi-VN")}
              </p>
            </div>
            <div
              className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${statusConfig.color}`}
            >
              <StatusIcon className="w-4 h-4" />
              {statusConfig.text}
            </div>
          </div>
        </div>

        {/* 2. Status Stepper */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Trạng thái đơn hàng</h3>
          {order.status === "cancelled" ? (
             <div className="flex items-center justify-center gap-2 p-4 rounded-lg bg-red-50 text-red-700">
                <XCircle className="w-6 h-6" />
                <span className="font-semibold">Đơn hàng đã bị hủy</span>
             </div>
          ) : (
            <div className="flex justify-between items-start relative">
              {allStatuses.map((status, index) => {
                const isCompleted = index < currentStepIndex;
                const isActive = index === currentStepIndex;
                return (
                  <React.Fragment key={status.key}>
                    {/* Line connecting steps */}
                    {index > 0 && (
                       <div className="flex-1 h-0.5 mt-[1.125rem] relative">
                         <div className="absolute w-full h-full bg-gray-200"></div>
                         <div
                            className="absolute w-full h-full bg-blue-600 transition-all duration-500"
                            style={{ width: isCompleted ? '100%' : (isActive ? '0%' : '0%') }}
                         ></div>
                       </div>
                    )}
                    
                    {/* Step item */}
                    <div className="flex flex-col items-center w-20">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                          isCompleted
                            ? "bg-blue-600 border-blue-600 text-white"
                            : isActive
                            ? "bg-blue-100 border-blue-600 text-blue-600"
                            : "bg-gray-100 border-gray-300 text-gray-400"
                        }`}
                      >
                        {isCompleted ? <Check className="w-5 h-5" /> : <status.icon className="w-5 h-5" />}
                      </div>
                      <p
                        className={`text-xs text-center font-semibold mt-2 ${
                          isActive ? "text-blue-600" : isCompleted ? "text-gray-900" : "text-gray-500"
                        }`}
                      >
                        {status.text}
                      </p>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 3a. Left Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Delivery Tracking Card */}
            {!hideTracking && (rC || cC) && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <h3 className="font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-purple-600" />
                    Theo dõi giao hàng
                  </h3>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-700">{statusMessage}</p>
                  </div>
                </div>
                <div className="h-72 border-t">
                  <MapContainer
                    center={[
                      dronePos?.lat || cC?.lat || rC?.lat || 21.0278,
                      dronePos?.lng || cC?.lng || rC?.lng || 105.8342,
                    ]}
                    zoom={13}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    {rC && (
                      <Marker position={[rC.lat, rC.lng]} icon={restaurantIcon}>
                        <Popup>🏠 Nhà hàng: {order.restaurantId?.name}</Popup>
                      </Marker>
                    )}
                    {cC && (
                      <Marker position={[cC.lat, cC.lng]} icon={customerIcon}>
                        <Popup>📍 Địa chỉ giao hàng</Popup>
                      </Marker>
                    )}
                    {dronePos && (
                      <Marker position={[dronePos.lat, dronePos.lng]} icon={droneIcon}>
                        <Popup>🚁 Drone đang bay</Popup>
                      </Marker>
                    )}
                    {routeCoords && (
                      <Polyline
                        positions={routeCoords}
                        color="#8b5cf6"
                        weight={4}
                        dashArray="5,5"
                      />
                    )}
                    <FitBounds points={points} />
                  </MapContainer>
                </div>
              </div>
            )}

            {/* Items Card */}
            <div className="bg-white rounded-lg shadow-md">
              {/* Restaurant Header */}
              <div className="p-6 border-b border-gray-200">
                <h3 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
                  <Store className="w-5 h-5 text-purple-600" />
                  {order.restaurantId?.name || "Chi tiết đơn hàng"}
                </h3>
                {order.restaurantId?.address && (
                  <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    {order.restaurantId.address}
                  </p>
                )}
              </div>
              {/* Item List */}
              <div className="p-6">
                <ul className="space-y-4">
                  {(order.items || []).map((item, idx) => (
                    <li key={idx} className="flex justify-between items-start gap-4">
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm font-semibold">
                          {item.quantity}x
                        </span>
                        <div>
                          <p className="font-medium text-gray-800">
                            {item.productId?.name || item.name || "Món"}
                          </p>
                          {/* <p className="text-sm text-gray-500">Ghi chú (nếu có)</p> */}
                        </div>
                      </div>
                      <p className="font-semibold text-gray-700 text-sm whitespace-nowrap">
                        {Intl.NumberFormat("vi-VN").format(
                          (item.priceAtOrderTime || item.price || 0) * (item.quantity || 1)
                        )}đ
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* 3b. Right Column */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Delivery Address Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Địa chỉ giao hàng
              </h3>
              <div className="space-y-2 text-sm">
                {viewerRole !== "customer" && (
                  <>
                    <p className="font-medium text-gray-700">
                      {order.userId?.name || "Khách hàng"}
                    </p>
                    <p className="text-gray-600">
                      {order.userId?.email || "N/A"}
                    </p>
                  </>
                )}
                {order.shippingAddress?.text && (
                  <p className="text-gray-600 pt-1">
                    {order.shippingAddress.text}
                  </p>
                )}
              </div>
            </div>

            {/* Payment Summary Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-green-600" />
                Tóm tắt thanh toán
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Hình thức</span>
                  <span className="font-medium text-gray-800">{paymentMethodLabel}</span>
                </div>
                {/* <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tạm tính</span>
                  <span className="font-medium text-gray-800">...đ</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Phí giao hàng</span>
                  <span className="font-medium text-gray-800">...đ</span>
                </div> 
                */}
                <hr className="border-gray-200" />
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900 text-lg">Tổng cộng</span>
                  <span className="font-bold text-green-700 text-xl">
                    {Intl.NumberFormat("vi-VN").format(order.totalPrice || 0)}đ
                  </span>
                </div>
              </div>
            </div>

            {/* Confirm Button */}
            {order?.status !== "completed" &&
              (order?.status === "delivering" || delivery?.status === "arrived") && (
                <button
                  disabled={confirming}
                  onClick={confirmOrderReceived}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                >
                  <CheckCircle className="w-5 h-5" />
                  {confirming ? "Đang xác nhận..." : "Xác nhận đã nhận hàng"}
                </button>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}