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
// ✅ THAY ĐỔI QUAN TRỌNG: Import CSS của Leaflet
import "leaflet/dist/leaflet.css";

// ✅ THAY ĐỔI QUAN TRỌNG: Import trực tiếp các tệp ảnh marker
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

import { toast } from "react-toastify";

// ✅ THAY ĐỔI QUAN TRỌNG: Cấu hình lại Default Icon với các đường dẫn đã import
// Một số phiên bản cũ của Leaflet có thể cần dòng này để tránh lỗi
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetinaUrl,
  iconUrl: iconUrl,
  shadowUrl: shadowUrl,
});

// Component để tự động cập nhật vị trí bản đồ
function MapUpdater({ position }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([position.lat, position.lng], map.getZoom());
  }, [position, map]);

  return null;
}

export default function PaymentPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [position, setPosition] = useState({ lat: 21.0278, lng: 105.8342 });
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
      if (!res.ok) {
        toast.error("Không thể tải giỏ hàng");
        navigate("/products");
        return;
      }
      const data = await res.json();
      setCart(data);
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi tải giỏ hàng");
    } finally {
      setLoading(false);
    }
  };

  const doSearch = useCallback(async (q) => {
    if (!q) {
      setSuggestions([]);
      return;
    }
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
    if (query.trim() === "") {
      setSuggestions([]);
      return;
    }

    const timerId = setTimeout(() => {
      doSearch(query);
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
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

  function MapClickHandler() {
    useMapEvents({
      click(e) {
        setPosition(e.latlng);
        reverseGeocode(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
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

  const handleConfirm = async () => {
    if (!cart || !cart.items || cart.items.length === 0) {
      toast.error("Giỏ hàng trống");
      return;
    }

    if (!address || address.trim() === "") {
      toast.error("Vui lòng chọn địa chỉ giao hàng trên bản đồ");
      return;
    }

    setCreating(true);
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      const items = cart.items.map((it) => ({
        productId: it.productId._id || it.productId,
        quantity: it.quantity,
        priceAtOrderTime: it.productId.price || it.priceAtOrderTime || 0,
      }));

      const restaurantId =
        cart.items[0].productId.restaurantId?._id ||
        cart.items[0].productId.restaurantId ||
        null;

      const payload = {
        userId: user.id || user._id,
        restaurantId,
        items,
        totalPrice: cart.totalPrice,
        paymentMethod,
        shippingAddress: {
          text: address,
          location: position,
        },
      };

      const res = await fetch("http://localhost:5000/api/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Tạo đơn thất bại");
      }

      const created = await res.json();

      if (paymentMethod === "VNPAY") {
        const payRes = await fetch(`http://localhost:5000/api/payment`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            orderId: created._id,
            amount: created.totalPrice,
            method: "VNPAY",
          }),
        });

        if (payRes.ok) {
          const payData = await payRes.json();
          if (payData.paymentUrl) {
            window.location.href = payData.paymentUrl;
            return;
          }
        }
      }

      await clearCartOnServer(cart._id);
      toast.success("Tạo đơn thành công");
      navigate(`/orders/${created._id}`);
    } catch (err) {
      console.error("Create order error:", err);
      toast.error(err.message || "Lỗi khi tạo đơn");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
        <p className="mt-3">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Thanh toán</h2>

      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="font-semibold mb-2">Địa chỉ giao hàng</h3>
        <input
          className="border p-2 w-full mb-2 rounded"
          placeholder="Tìm địa chỉ..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
          }}
        />
        {suggestions.length > 0 && (
          <div className="bg-white border rounded max-h-40 overflow-auto mb-2">
            {suggestions.map((s) => (
              <div
                key={s.place_id}
                className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                onClick={() => selectSuggestion(s)}
              >
                {s.display_name}
              </div>
            ))}
          </div>
        )}

        <div className="h-64 mb-3 relative z-0">
          <MapContainer
            center={[position.lat, position.lng]}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[position.lat, position.lng]} />
            <MapClickHandler />
            <MapUpdater position={position} />
          </MapContainer>
</div>

        <textarea
          readOnly
          value={address}
          className="border p-2 w-full rounded h-20 mb-3"
        />

        <h3 className="font-semibold mb-2">Phương thức thanh toán</h3>
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="border p-2 rounded w-full mb-4"
        >
          <option value="COD">Thanh toán khi nhận (COD)</option>
          <option value="VNPAY">VNPAY (online)</option>
        </select>

        <div className="mb-4">
          <h4 className="font-semibold">Tóm tắt đơn</h4>
          {cart?.items?.map((it) => (
            <div
              key={it.productId._id || it.productId}
              className="flex justify-between py-2 border-b"
            >
              <div>
                <div className="font-medium">
                  {it.productId.name || it.productId}
                </div>
                <div className="text-sm text-gray-500">
                  Số lượng: {it.quantity}
                </div>
              </div>
              <div className="font-bold text-green-600">
                {(
                  it.productId.price * it.quantity ||
                  it.priceAtOrderTime * it.quantity ||
                  0
                ).toLocaleString("vi-VN")}
                ₫
              </div>
            </div>
          ))}
          <div className="flex justify-between mt-3 font-bold">
            <div>Tổng</div>
            <div className="text-xl text-green-600">
              {(cart?.totalPrice || 0).toLocaleString("vi-VN")}₫
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate("/cart")}
            className="flex-1 bg-gray-200 py-2 rounded"
          >
            Quay lại giỏ
          </button>
          <button
            disabled={creating}
            onClick={handleConfirm}
            className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            {creating ? "Đang xử lý..." : "Xác nhận và đặt hàng"}
          </button>
        </div>
      </div>
    </div>
  );
}