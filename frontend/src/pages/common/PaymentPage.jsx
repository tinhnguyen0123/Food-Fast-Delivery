import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
import { toast } from "react-toastify";

// Leaflet icon setup
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

function MapUpdater({ position }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([position.lat, position.lng], map.getZoom());
  }, [position, map]);
  return null;
}

function MapClickHandler({ setPosition, reverseGeocode }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      reverseGeocode(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function PaymentPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [position, setPosition] = useState({ lat: 10.760159513948246, lng: 106.68223683790899 });
  const [address, setAddress] = useState("");
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.info("Vui lòng đăng nhập để thanh toán");
        navigate("/login");
        return;
      }
      const res = await fetch("http://localhost:5000/api/cart/latest", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Không thể tải giỏ hàng");
      const data = await res.json();
      setCart(data);

      if (data._sanitized && data._removedItems?.length) {
        data._removedItems.forEach((n) =>
          toast.warning(`Món '${n}' đã bị loại khỏi giỏ vì không còn khả dụng`)
        );
      }
    } catch (e) {
      toast.error(e.message || "Lỗi khi tải giỏ hàng");
    } finally {
      setLoading(false);
    }
  };

  const doSearch = useCallback(async (q) => {
    if (!q) return setSuggestions([]);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          q
        )}&addressdetails=1&limit=5`
      );
      const list = await res.json();
      setSuggestions(list || []);
    } catch (e) {
      console.error("OSM search error", e);
    }
  }, []);

  useEffect(() => {
    if (!query.trim()) return setSuggestions([]);
    const timer = setTimeout(() => doSearch(query), 500);
    return () => clearTimeout(timer);
  }, [query, doSearch]);

  async function reverseGeocode(lat, lng) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const j = await res.json();
      setAddress(j.display_name || "");
    } catch (e) {
      console.error("Reverse geocode error", e);
    }
  }

  const selectSuggestion = (s) => {
    setPosition({ lat: parseFloat(s.lat), lng: parseFloat(s.lon) });
    setAddress(s.display_name);
    setSuggestions([]);
    setQuery("");
  };

  const clearCartOnServer = async (cartId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !cartId) return;
      await fetch(`http://localhost:5000/api/cart/${cartId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (e) {
      console.warn("Cannot clear cart:", e);
    }
  };

  const groupByRestaurant = () => {
    if (!cart?.items) return [];

    const groups = {};
    cart.items.forEach((item) => {
      const product = item.productId;
      if (!product) return;

      const restaurantId = product?.restaurantId?._id || product?.restaurantId;
      const restaurantName =
        product?.restaurantId?.name || "Nhà hàng chưa xác định";

      if (!groups[restaurantId]) {
        groups[restaurantId] = {
          restaurantId,
          restaurantName,
          items: [],
          subtotal: 0,
        };
      }

      const price = Number(product?.price || 0);
      const qty = Number(item?.quantity || 0);
      groups[restaurantId].items.push(item);
      groups[restaurantId].subtotal += price * qty;
    });

    return Object.values(groups);
  };

  // ✅ PHIÊN BẢN ĐÃ SỬA — CÓ GOM ID ĐƠN & TRACKING MAP
  const handleCreateOrders = async () => {
    if (!cart?.items?.length) {
      toast.error("Giỏ hàng trống");
      return;
    }
    if (!address || !address.trim()) {
      toast.error("Vui lòng chọn hoặc tìm kiếm địa chỉ giao hàng trên bản đồ.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/cart/latest", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const latest = await res.json();

      if (latest._sanitized) {
        if (Array.isArray(latest._removedItems) && latest._removedItems.length) {
          latest._removedItems.forEach((name) =>
            toast.error(`Món ăn '${name}' không còn khả dụng`)
          );
        } else {
          toast.warning(
            "Giỏ hàng đã được cập nhật do có món không còn khả dụng. Vui lòng kiểm tra lại."
          );
        }
        setCart(latest);
        return;
      }
    } catch (err) {
      console.error("Error re-check cart:", err);
      toast.error("Không thể kiểm tra giỏ hàng");
      return;
    }

    setCreating(true);
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
        // 1. Gói tất cả thông tin vào một payload duy nhất
      // Backend (order.services.js) của bạn đã hỗ trợ việc này
      const orderPayload = {
        userId: user.id || user._id,
        items: cart.items.map((it) => ({
          productId: it.productId._id || it.productId,
          quantity: it.quantity,
        })),
        paymentMethod,
        shippingAddress: { text: address, location: position },
      };

      // 2. Gọi API tạo đơn hàng (1 LẦN DUY NHẤT)
      const orderRes = await fetch("http://localhost:5000/api/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderPayload),
      });

      if (!orderRes.ok) {
        const errorData = await orderRes.json();
        throw new Error(errorData.message || "Tạo đơn hàng thất bại.");
      }

      const creationResponse = await orderRes.json();

      // 3. Chuẩn hóa kết quả (backend có thể trả 1 object hoặc 1 array)
      const createdOrders = Array.isArray(creationResponse)
        ? creationResponse
        : [creationResponse];

      // 4. Nếu là COD, xử lý như cũ (xóa giỏ, chuyển trang)
      if (paymentMethod === "COD") {
        await clearCartOnServer(cart._id); // clearCartOnServer từ code cũ
        toast.success("Tạo đơn thành công");
        navigate("/orders");
        return; // Kết thúc
      }

      // 5. Nếu là MOMO
      if (paymentMethod === "MOMO") {
        // 5a. Lấy danh sách ID và tổng tiền
        const orderIds = createdOrders.map((o) => o._id);
        const grandTotal = createdOrders.reduce(
          (sum, o) => sum + o.totalPrice,
          0
        );

        // 5b. Gọi API thanh toán (1 LẦN DUY NHẤT)
        const payRes = await fetch(`http://localhost:5000/api/payment`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            orderIds: orderIds,
            amount: grandTotal,
            method: "MOMO",
          }),
        });

        if (!payRes.ok) {
          const payErrorData = await payRes.json().catch(() => ({}));
          throw new Error(payErrorData.message || "Không thể tạo thanh toán MoMo");
        }

        const payData = await payRes.json();
        if (payData.paymentUrl) {
          // 5c. Chuyển hướng tới MoMo.
          // QUAN TRỌNG: KHÔNG XÓA GIỎ HÀNG Ở ĐÂY
          localStorage.setItem("currentCartId", cart._id);
          window.location.href = payData.paymentUrl;
          return;
        }
          throw new Error("Không thể tạo thanh toán MoMo");
        }
      }
      catch (err) {
          console.error("Create order error:", err);
          toast.error(err.message || "Lỗi khi tạo đơn");
        } finally {
          // Chỉ setCreating(false) nếu không phải chuyển hướng MoMo
          if (paymentMethod !== "MOMO") {
            setCreating(false);
          }
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
        <p className="mt-3 text-gray-600">Đang tải...</p>
      </div>
    );
  }

  const restaurantGroups = groupByRestaurant();
  const total = cart?.totalPrice
    ? cart.totalPrice
    : restaurantGroups.reduce((sum, g) => sum + g.subtotal, 0);

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 p-4">
      {/* Cột trái: Địa chỉ & Bản đồ */}
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">Địa chỉ giao hàng</h2>

          <input
            className="border p-3 w-full mb-3 rounded-lg"
            placeholder="Tìm địa chỉ..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          {suggestions.length > 0 && (
            <div className="bg-white border rounded-lg max-h-40 overflow-auto mb-3">
              {suggestions.map((s) => (
                <div
                  key={s.place_id}
                  className="p-3 hover:bg-gray-100 cursor-pointer text-sm border-b last:border-0"
                  onClick={() => selectSuggestion(s)}
                >
                  {s.display_name}
                </div>
              ))}
            </div>
          )}

          <div className="h-64 mb-3 relative z-0 rounded-lg overflow-hidden">
            <MapContainer
              center={[position.lat, position.lng]}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[position.lat, position.lng]} />
              <MapClickHandler
                setPosition={setPosition}
                reverseGeocode={reverseGeocode}
              />
              <MapUpdater position={position} />
            </MapContainer>
          </div>

          <textarea
            readOnly
            value={address}
            placeholder="Địa chỉ sẽ hiển thị ở đây..."
            className="border p-3 w-full rounded-lg h-20 resize-none"
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-3">Phương thức thanh toán</h3>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="border p-3 rounded-lg w-full"
          >
            <option value="COD">💵 Thanh toán khi nhận (COD)</option>
            <option value="MOMO">💳 Ví MoMo (online)</option>
          </select>
        </div>
      </div>

      {/* Cột phải: Tóm tắt đơn hàng */}
      <div className="bg-white p-6 rounded-lg shadow h-fit sticky top-6">
        <h3 className="text-xl font-bold mb-4">Tóm tắt đơn hàng</h3>

        <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
          {restaurantGroups.length === 0 && (
            <p className="text-gray-500 text-center py-4">Giỏ hàng trống.</p>
          )}

          {restaurantGroups.map((group) => (
            <div key={group.restaurantId} className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b">
                <span className="text-lg">🏪</span>
                <div>
                  <h4 className="font-semibold text-base">
                    {group.restaurantName}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {group.items.length} món
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {group.items.map((it, idx) => {
                  const product = it.productId;
                  const productName = product?.name || "Món ăn";
                  const productPrice = Number(product?.price || 0);
                  const quantity = Number(it?.quantity || 0);

                  return (
                    <div
                      key={product?._id || `${group.restaurantId}-${idx}`}
                      className="flex justify-between items-start text-sm"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{productName}</div>
                        <div className="text-gray-500 text-xs">
                          {productPrice.toLocaleString("vi-VN")}₫ × {quantity}
                        </div>
                      </div>
                      <div className="font-semibold text-green-600">
                        {(productPrice * quantity).toLocaleString("vi-VN")}₫
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between mt-3 pt-2 border-t text-sm">
                <span className="text-gray-600">Tạm tính</span>
                <span className="font-semibold">
                  {group.subtotal.toLocaleString("vi-VN")}₫
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between mb-4 text-lg">
            <span className="font-bold">Tổng cộng</span>
            <span className="text-2xl font-bold text-green-600">
              {total.toLocaleString("vi-VN")}₫
            </span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate("/cart")}
              className="flex-1 bg-gray-200 py-3 rounded-lg hover:bg-gray-300 transition font-semibold"
            >
              ← Quay lại
            </button>
            <button
              disabled={creating}
              onClick={handleCreateOrders}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50"
            >
              {creating ? "Đang xử lý..." : "Xác nhận"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
