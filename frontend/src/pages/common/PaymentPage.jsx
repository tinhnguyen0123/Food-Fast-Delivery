import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { toast } from "react-toastify";

// ✅ Fix icon paths
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export default function PaymentPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [position, setPosition] = useState({ lat: 21.0278, lng: 105.8342 }); // Hà Nội mặc định
  const [address, setAddress] = useState("");
  const [query, setQuery] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [creating, setCreating] = useState(false);

  const [suggestions, setSuggestions] = useState([]);
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const searchAbortRef = useRef(null);
  const debounceRef = useRef(null);
  const EMAIL_FOR_NOMINATIM = "dev@foodfast.local"; // định danh client cho OSM

  // 🧭 Tải giỏ hàng
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
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCart(data);
    } catch {
      toast.error("Không thể tải giỏ hàng");
      navigate("/products");
    } finally {
      setLoading(false);
    }
  };

  // 🔍 Forward geocode 1 lần (nút "Tìm" hoặc nhấn Enter)
  const forwardGeocodeOnce = async (text) => {
    if (!text?.trim()) return null;
    if (searchAbortRef.current) searchAbortRef.current.abort();
    const controller = new AbortController();
    searchAbortRef.current = controller;


    
    try {
      const delta = 0.3;
      const minLat = position.lat - delta;
      const maxLat = position.lat + delta;
      const minLng = position.lng - delta;
      const maxLng = position.lng + delta;

      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=5&countrycodes=vn&accept-language=vi&email=${encodeURIComponent(
        EMAIL_FOR_NOMINATIM
      )}&q=${encodeURIComponent(text)}&viewbox=${minLng},${maxLat},${maxLng},${minLat}&bounded=1`;

      const res = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
      if (!res.ok) return null;
      const list = await res.json();
      return (list || []).map((x) => ({
        id: x.place_id,
        label: x.display_name,
        lat: parseFloat(x.lat),
        lon: parseFloat(x.lon),
        addr: x.address || {},
      }));
    } catch (e) {
      if (e.name !== "AbortError") console.warn("OSM forward geocode error", e);
      return null;
    }
  };

  // 🔍 Debounce tìm kiếm
  useEffect(() => {
    if (!query?.trim()) {
      setSuggestions([]);
      setIsSuggestOpen(false);
      setHighlightIndex(-1);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const list = await forwardGeocodeOnce(query);
      if (!list) return;
      setSuggestions(list);
      setIsSuggestOpen(list.length > 0);
      setHighlightIndex(list.length ? 0 : -1);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, position.lat, position.lng]);

  // 🗺️ Reverse geocode khi click
  async function reverseGeocode(lat, lng) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=vi&email=${encodeURIComponent(
          EMAIL_FOR_NOMINATIM
        )}`
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

  function RecenterOnPosition({ lat, lng }) {
    const map = useMapEvents({});
    useEffect(() => {
      map.setView([lat, lng], map.getZoom(), { animate: true });
    }, [lat, lng]);
    return null;
  }

  const selectSuggestion = (s) => {
    setPosition({ lat: s.lat, lng: s.lon });
    setAddress(s.label);
    setQuery(s.label);
    setIsSuggestOpen(false);
    setSuggestions([]);
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

  // ✅ Xác nhận đơn hàng
  const handleConfirm = async () => {
    if (!cart || !cart.items?.length) return toast.error("Giỏ hàng trống");
    if (!address.trim()) return toast.error("Vui lòng chọn địa chỉ giao hàng");

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
        shippingAddress: { text: address, location: position },
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
        const payRes = await fetch("http://localhost:5000/api/payment", {
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
        const payData = await payRes.json();
        if (payData.paymentUrl) return (window.location.href = payData.paymentUrl);
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

  if (loading)
    return (
      <div className="text-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
        <p className="mt-3">Đang tải...</p>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Thanh toán</h2>

      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="font-semibold mb-2">Địa chỉ giao hàng</h3>

        <div className="relative">
          <div className="flex gap-2">
            <input
              className="border p-2 w-full mb-2 rounded"
              placeholder="Nhập địa chỉ (VD: 1 Tràng Tiền, Hoàn Kiếm, Hà Nội)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => suggestions.length && setIsSuggestOpen(true)}
              onKeyDown={async (e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (isSuggestOpen && suggestions.length > 0 && highlightIndex >= 0) {
                    const s = suggestions[highlightIndex];
                    if (s) selectSuggestion(s);
                    return;
                  }
                  const list = await forwardGeocodeOnce(query);
                  if (list?.length) selectSuggestion(list[0]);
                  else toast.info("Không tìm thấy địa chỉ phù hợp");
                } else if (e.key === "ArrowDown" && suggestions.length > 0) {
                  e.preventDefault();
                  setHighlightIndex((i) => (i + 1) % suggestions.length);
                } else if (e.key === "ArrowUp" && suggestions.length > 0) {
                  e.preventDefault();
                  setHighlightIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
                } else if (e.key === "Escape") setIsSuggestOpen(false);
              }}
              onBlur={() => setTimeout(() => setIsSuggestOpen(false), 150)}
            />
            <button
              className="mb-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={async () => {
                const list = await forwardGeocodeOnce(query);
                if (list?.length) selectSuggestion(list[0]);
                else toast.info("Không tìm thấy địa chỉ phù hợp");
              }}
            >
              Tìm
            </button>
          </div>

          {isSuggestOpen && suggestions.length > 0 && (
            <div className="absolute z-20 left-0 right-0 bg-white border rounded shadow max-h-56 overflow-auto">
              {suggestions.map((s, idx) => {
                const line1 =
                  s.addr.road ||
                  s.addr.residential ||
                  s.addr.neighbourhood ||
                  s.addr.village ||
                  s.addr.suburb ||
                  "";
                const line2 =
                  s.addr.city ||
                  s.addr.town ||
                  s.addr.county ||
                  s.addr.state ||
                  s.addr.province ||
                  "Việt Nam";
                return (
                  <div
                    key={s.id}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => selectSuggestion(s)}
                    className={`px-3 py-2 cursor-pointer text-sm ${
                      idx === highlightIndex ? "bg-blue-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="font-medium">{line1 || s.label}</div>
                    <div className="text-gray-500">{line2}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="h-64 mb-3">
          <MapContainer center={[position.lat, position.lng]} zoom={13} style={{ height: "100%", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[position.lat, position.lng]} />
            <RecenterOnPosition lat={position.lat} lng={position.lng} />
            <MapClickHandler />
          </MapContainer>
        </div>

        <textarea readOnly value={address} className="border p-2 w-full rounded h-20 mb-3" />

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
            <div key={it.productId._id || it.productId} className="flex justify-between py-2 border-b">
              <div>
                <div className="font-medium">{it.productId.name || it.productId}</div>
                <div className="text-sm text-gray-500">Số lượng: {it.quantity}</div>
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
          <button onClick={() => navigate("/cart")} className="flex-1 bg-gray-200 py-2 rounded">
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
