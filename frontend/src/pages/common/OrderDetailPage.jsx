import React, { useEffect, useState } from "react";
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
} from "lucide-react";

import { MapContainer, TileLayer, Marker, Polyline, useMap, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

// --- Fix leaflet default icon ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

// --- Custom Icons ---
const restaurantIcon = L.divIcon({ className: "text-3xl", html: "🏠" });
const customerIcon = L.divIcon({ className: "text-3xl", html: "📍" });
const droneIcon = L.divIcon({ className: "text-2xl", html: "🚁" });

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

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [dronePos, setDronePos] = useState(null);
  const [routeCoords, setRouteCoords] = useState(null);

  // --- Load order ---
  useEffect(() => {
    const loadOrder = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/api/order/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Không thể tải thông tin đơn hàng");
        const data = await res.json();
        setOrder(data);

        // --- Tạo đường thẳng giữa nhà hàng và khách ---
        const r = data?.restaurantId?.locationId?.coords;
        const c = data?.shippingAddress?.location;
        if (r?.lat && r?.lng && c?.lat && c?.lng) {
          const straightLine = [];
          const steps = 20;
          for (let i = 0; i <= steps; i++) {
            const ratio = i / steps;
            const lat = r.lat + (c.lat - r.lat) * ratio;
            const lng = r.lng + (c.lng - r.lng) * ratio;
            straightLine.push([lat, lng]);
          }
          setRouteCoords(straightLine);
        }
      } catch (err) {
        console.error(err);
        toast.error(err.message || "Lỗi khi tải đơn hàng");
      } finally {
        setLoading(false);
      }
    };
    loadOrder();
  }, [id]);

  // --- Poll drone position every 3s ---
  useEffect(() => {
    if (!id) return;
    let mounted = true;
    let timer;

    const pollDelivery = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/api/delivery/order/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        setDelivery(data);
        const dLoc = data?.droneId?.currentLocationId?.coords;
        setDronePos(dLoc || null);
      } catch {}
    };

    pollDelivery();
    timer = setInterval(pollDelivery, 3000);
    return () => {
      mounted = false;
      if (timer) clearInterval(timer);
    };
  }, [id]);

  const getStatusConfig = (status) => {
    const configs = {
      pending: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock, text: "Chờ xử lý" },
      preparing: { color: "bg-blue-100 text-blue-800 border-blue-200", icon: ShoppingBag, text: "Đang chuẩn bị" },
      delivering: { color: "bg-purple-100 text-purple-800 border-purple-200", icon: Truck, text: "Đang giao" },
      completed: { color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle, text: "Đã giao" },
      cancelled: { color: "bg-red-100 text-red-800 border-red-200", icon: XCircle, text: "Đã hủy" },
    };
    return configs[status] || configs.pending;
  };

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
      setOrder((prev) => ({ ...prev, status: "completed" }));
      toast.success("Đã xác nhận hoàn thành đơn hàng");
      const list = JSON.parse(localStorage.getItem("notifQueue") || "[]");
      const filtered = list.filter((n) => n.orderId !== order._id);
      localStorage.setItem("notifQueue", JSON.stringify(filtered));
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Lỗi xác nhận");
    } finally {
      setConfirming(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="text-center">
        <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Đang tải thông tin đơn hàng...</p>
      </div>
    </div>
  );

  if (!order) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="text-center bg-white rounded-2xl shadow-lg p-12">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Package className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Không tìm thấy đơn hàng</h2>
        <p className="text-gray-600 mb-6">Đơn hàng không tồn tại hoặc đã bị xóa</p>
        <button
          onClick={() => navigate("/orders")}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại danh sách đơn hàng
        </button>
      </div>
    </div>
  );

  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;

  const rC = order?.restaurantId?.locationId?.coords;
  const cC = order?.shippingAddress?.location;
  const points = [
    rC && [rC.lat, rC.lng],
    cC && [cC.lat, cC.lng],
    dronePos && [dronePos.lat, dronePos.lng],
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/orders")}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Quay lại danh sách đơn hàng</span>
          </button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Chi tiết đơn hàng
          </h1>
        </div>

        {/* Order Info */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="p-6 space-y-6">
            {/* Order Header */}
            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Package className="w-6 h-6" />
                  <span className="font-semibold">Mã đơn hàng</span>
                </div>
                <p className="font-mono text-sm text-gray-800/90">#{order._id.slice(-8)}</p>
              </div>
              <div className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 flex items-center gap-2 ${statusConfig.color}`}>
                <StatusIcon className="w-4 h-4" />
                {statusConfig.text}
              </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-600 mb-1">Ngày đặt hàng</p>
                  <p className="font-semibold text-gray-800">{new Date(order.createdAt).toLocaleString("vi-VN")}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-600 mb-1">Phương thức thanh toán</p>
                  <p className="font-semibold text-gray-800">
                    {order.paymentMethod === "MOMO"
                      ? order.paymentId?.status === "paid"
                        ? "✅ Đã thanh toán qua MoMo"
                        : order.paymentId?.status === "failed"
                        ? "❌ Thanh toán MoMo thất bại"
                        : "⏳ Chờ thanh toán MoMo"
                      : "💵 Thanh toán khi nhận hàng"}
                  </p>
                </div>
              </div>
            </div>

            {/* Tracking Map */}
            {(rC || cC) && (
              <div className="mt-6">
                <h3 className="font-semibold text-lg text-gray-800 mb-3 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-purple-600" />
                  Theo dõi đơn hàng
                </h3>
                <div className="h-72 rounded-xl overflow-hidden border mt-2">
                  <MapContainer
                    center={[
                      dronePos?.lat || cC?.lat || rC?.lat || 21.0278,
                      dronePos?.lng || cC?.lng || rC?.lng || 105.8342,
                    ]}
                    zoom={13}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    {rC && <Marker position={[rC.lat, rC.lng]} icon={restaurantIcon}><Popup>🏠 Nhà hàng: {order.restaurantId?.name}</Popup></Marker>}
                    {cC && <Marker position={[cC.lat, cC.lng]} icon={customerIcon}><Popup>📍 Địa chỉ giao hàng</Popup></Marker>}
                    {dronePos && <Marker position={[dronePos.lat, dronePos.lng]} icon={droneIcon}><Popup>🚁 Drone đang bay</Popup></Marker>}
                    {routeCoords && <Polyline positions={routeCoords} color="#8b5cf6" weight={4} dashArray="5,5" />}
                    <FitBounds points={points} />
                  </MapContainer>

                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      {!delivery
                        ? "⏳ Đơn hàng chưa được gán drone. Vui lòng chờ nhà hàng xử lý."
                        : delivery.status === "waiting"
                        ? "⏳ Đơn hàng đã được gán drone, đang chờ xuất phát."
                        : delivery.status === "arrived"
                        ? "✅ Drone đã giao hàng đến nơi. Vui lòng xác nhận đã nhận hàng."
                        : dronePos
                        ? "🚁 Drone đang bay thẳng đến địa chỉ. Bản đồ tự động cập nhật mỗi 3 giây."
                        : "📍 Drone đã nhận đơn nhưng chưa cập nhật vị trí."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Items */}
            <div className="border-t pt-6">
              <h3 className="font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-blue-600" />
                Chi tiết món ({order.items.length})
              </h3>
              <div className="space-y-3">
                {order.items.map((item) => {
                  const unitPrice = Number(item.priceAtOrderTime ?? item.productId?.price ?? 0);
                  const lineTotal = unitPrice * Number(item.quantity || 0);
                  return (
                    <div key={item.productId._id || item.productId} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                          <span className="text-3xl">🍜</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{item.productId.name}</p>
                          <p className="text-sm text-gray-600">{unitPrice.toLocaleString("vi-VN")}₫ × {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-bold text-blue-600 text-lg">{lineTotal.toLocaleString("vi-VN")}₫</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Shipping */}
            {order.shippingAddress && (
              <div className="border-t pt-6">
                <h3 className="font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-red-600" />
                  Địa chỉ giao hàng
                </h3>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-gray-800 font-medium mb-2">{order.shippingAddress.text}</p>
                  {order.shippingAddress.location && (
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      Tọa độ: {order.shippingAddress.location.lat.toFixed(6)}, {order.shippingAddress.location.lng.toFixed(6)}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Restaurant */}
            {order.restaurantId && (
              <div className="border-t pt-6">
                <h3 className="font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
                  <Store className="w-5 h-5 text-orange-600" />
                  Thông tin nhà hàng
                </h3>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <p className="font-semibold text-gray-800 text-lg mb-1">{order.restaurantId.name}</p>
                  <p className="text-gray-600 flex items-center gap-1"><MapPin className="w-4 h-4" />{order.restaurantId.address}</p>
                </div>
              </div>
            )}

            {/* Total */}
            <div className="border-t pt-6">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Tổng thanh toán</p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      {order.totalPrice?.toLocaleString("vi-VN")}₫
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center text-white text-2xl">
                    💰
                  </div>
                </div>
              </div>
            </div>

            {/* Confirm button */}
            {order.status === "delivering" && (
              <div className="mt-8 flex justify-center">
                <button
                  disabled={confirming}
                  onClick={confirmOrderReceived}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg transition disabled:opacity-50"
                >
                  <CheckCircle className="w-5 h-5" />
                  {confirming ? "Đang xác nhận..." : "Xác nhận đã nhận hàng"}
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
