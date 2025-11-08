import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
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

// Fix icon Leaflet
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

export default function RestaurantRegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form fields
  const [form, setForm] = useState({
    restaurantName: "",
    address: "",
    phone: "",
    email: "",
    password: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  // Map + search
  const [position, setPosition] = useState({ lat: 21.0278, lng: 105.8342 });
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const onSelectFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
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
    const timerId = setTimeout(() => doSearch(query), 500);
    return () => clearTimeout(timerId);
  }, [query, doSearch]);

  async function reverseGeocode(lat, lng) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const j = await res.json();
      setForm((p) => ({ ...p, address: j.display_name || p.address }));
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
    const lat = parseFloat(s.lat);
    const lng = parseFloat(s.lon);
    setPosition({ lat, lng });
    setForm((p) => ({ ...p, address: s.display_name }));
    setSuggestions([]);
    setQuery("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    if (!form.restaurantName || !form.email || !form.password) {
      toast.error("Vui lòng nhập đủ tên nhà hàng, email và mật khẩu");
      return;
    }
    if (!form.address) {
      toast.error("Vui lòng chọn địa chỉ trên bản đồ hoặc nhập địa chỉ");
      return;
    }
    if (!imageFile) {
      toast.error("Vui lòng chọn ảnh đại diện nhà hàng");
      return;
    }

    setCreating(true);
    try {
      // 1) Đăng ký tài khoản user với role = restaurant
      const regRes = await fetch("http://localhost:5000/api/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.restaurantName,
          email: form.email,
          password: form.password,
          phone: form.phone,
          role: "restaurant",
        }),
      });

      const regData = await regRes.json();
      if (!regRes.ok) {
        throw new Error(regData.message || "Đăng ký tài khoản thất bại");
      }

      // 2) Đăng nhập để lấy token
      const loginRes = await fetch("http://localhost:5000/api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const loginData = await loginRes.json();
      if (!loginRes.ok) {
        throw new Error(loginData.message || "Đăng nhập thất bại sau đăng ký");
      }

      const token = loginData.token;
      const user = loginData.user;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(loginData.user));

      // 3) Tạo Location cho nhà hàng
      const locRes = await fetch("http://localhost:5000/api/location", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.restaurantName,
          type: "restaurant",
          coords: { lat: position.lat, lng: position.lng },
          address: form.address,
        }),
      });

      const locData = await locRes.json();
      if (!locRes.ok) {
        throw new Error(locData.message || "Tạo vị trí thất bại");
      }

      // 4) Tạo Restaurant (multipart để upload ảnh)
      const fd = new FormData();
      fd.append("name", form.restaurantName);
      fd.append("ownerId", user.id || user._id);
      fd.append("phone", form.phone || "");
      fd.append("address", form.address || "");
      fd.append("locationId", locData._id);
      fd.append("image", imageFile);

      const restRes = await fetch("http://localhost:5000/api/restaurant", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: fd,
      });

      const restData = await restRes.json();
      if (!restRes.ok) {
        throw new Error(restData.message || "Tạo nhà hàng thất bại");
      }

      toast.success("Đăng ký nhà hàng thành công!");
      setTimeout(() => {
        navigate("/products");
      }, 1200);
    } catch (err) {
      console.error("Restaurant register error:", err);
      toast.error(err.message || "Có lỗi xảy ra");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4 text-blue-600 text-center">
        Đăng ký Nhà hàng
      </h2>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Tên nhà hàng</label>
            <input
              className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              name="restaurantName"
              placeholder="VD: Nhà hàng A"
              value={form.restaurantName}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Số điện thoại</label>
            <input
              className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              name="phone"
              placeholder="VD: 0901234567"
              value={form.phone}
              onChange={handleChange}
              type="tel"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Email</label>
            <input
              className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              name="email"
              type="email"
              placeholder="email@restaurant.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Mật khẩu</label>
            <input
              className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              name="password"
              type="password"
              placeholder="Tối thiểu 3 ký tự"
              value={form.password}
              onChange={handleChange}
              required
              minLength={3}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-gray-700 mb-1">Địa chỉ</label>
            <input
              className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-green-500 mb-2"
              placeholder="Tìm địa chỉ..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
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
            <textarea
              className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Địa chỉ chi tiết"
              value={form.address}
              onChange={(e) =>
                setForm((p) => ({ ...p, address: e.target.value }))
              }
              required
              rows={2}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-gray-700 mb-1">Vị trí trên bản đồ</label>
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
            <div className="text-sm text-gray-600">
              Tọa độ: {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-gray-700 mb-1">Ảnh đại diện nhà hàng</label>
            <input type="file" accept="image/*" onChange={onSelectFile} />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="mt-2 w-40 h-40 object-cover rounded border"
              />
            )}
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={creating}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
          >
            {creating ? "Đang tạo..." : "Đăng ký"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="border px-6 py-2 rounded hover:bg-gray-50 ml-auto"
          >
            ← Quay lại
          </button>
        </div>
      </form>
    </div>
  );
}
