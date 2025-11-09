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
import {
  Store,
  Phone,
  Mail,
  Lock,
  MapPin,
  Upload,
  ArrowLeft,
  CheckCircle,
  Search,
  Navigation,
  Image as ImageIcon,
} from "lucide-react";

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
  const [currentStep, setCurrentStep] = useState(1);

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

  const steps = [
    { id: 1, name: "Thông tin cơ bản", icon: Store },
    { id: 2, name: "Vị trí & Địa chỉ", icon: MapPin },
    { id: 3, name: "Ảnh đại diện", icon: ImageIcon },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mb-4 shadow-lg">
            <Store className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
            Đăng ký Nhà hàng
          </h1>
          <p className="text-gray-600">
            Bắt đầu hành trình kinh doanh của bạn cùng chúng tôi
          </p>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;

              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isCompleted
                          ? "bg-green-500 text-white"
                          : isCurrent
                          ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg scale-110"
                          : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
                    </div>
                    <p
                      className={`text-xs mt-2 font-medium ${
                        isCurrent ? "text-orange-600" : "text-gray-500"
                      }`}
                    >
                      {step.name}
                    </p>
                  </div>

                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-2 transition-all duration-300 ${
                        isCompleted ? "bg-green-500" : "bg-gray-200"
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center">
                    <Store className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      Thông tin cơ bản
                    </h2>
                    <p className="text-gray-600 text-sm">
                      Nhập thông tin nhà hàng và tài khoản
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tên nhà hàng <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        name="restaurantName"
                        placeholder="VD: Nhà hàng ABC"
                        value={form.restaurantName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                          name="email"
                          type="email"
                          placeholder="email@restaurant.com"
                          value={form.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Mật khẩu <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                          name="password"
                          type="password"
                          placeholder="Tối thiểu 3 ký tự"
                          value={form.password}
                          onChange={handleChange}
                          required
                          minLength={3}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Số điện thoại
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        name="phone"
                        placeholder="0901234567"
                        value={form.phone}
                        onChange={handleChange}
                        type="tel"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <button
                    type="button"
                    onClick={() => navigate("/register")}
                    className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Quay lại
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    Tiếp theo
                    <ArrowLeft className="w-5 h-5 rotate-180" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Location & Address */}
            {currentStep === 2 && (
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      Vị trí & Địa chỉ
                    </h2>
                    <p className="text-gray-600 text-sm">
                      Chọn vị trí nhà hàng trên bản đồ
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Search Address */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tìm kiếm địa chỉ
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                      <input
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        placeholder="Tìm địa chỉ..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                    </div>

                    {suggestions.length > 0 && (
                      <div className="mt-2 bg-white border-2 border-gray-200 rounded-xl max-h-48 overflow-auto shadow-lg">
                        {suggestions.map((s) => (
                          <div
                            key={s.place_id}
                            className="p-3 hover:bg-orange-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0 transition-colors"
                            onClick={() => selectSuggestion(s)}
                          >
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">
                                {s.display_name}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Map */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Chọn vị trí trên bản đồ
                    </label>
                    <div className="rounded-xl overflow-hidden border-2 border-gray-200 shadow-lg h-80 relative z-0">
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
                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                      <Navigation className="w-4 h-4 text-orange-500" />
                      <span>
                        Tọa độ: {position.lat.toFixed(5)},{" "}
                        {position.lng.toFixed(5)}
                      </span>
                    </div>
                  </div>

                  {/* Address Detail */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Địa chỉ chi tiết <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                      placeholder="Số nhà, tên đường, phường, quận..."
                      value={form.address}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, address: e.target.value }))
                      }
                      required
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Quay lại
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    Tiếp theo
                    <ArrowLeft className="w-5 h-5 rotate-180" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Restaurant Image */}
            {currentStep === 3 && (
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      Ảnh đại diện
                    </h2>
                    <p className="text-gray-600 text-sm">
                      Chọn ảnh đại diện cho nhà hàng của bạn
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Ảnh nhà hàng <span className="text-red-500">*</span>
                    </label>

                    {/* Upload Button */}
                    <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-all">
                      {imagePreview ? (
                        <div className="relative w-full h-full">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover rounded-xl"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-xl">
                            <div className="text-center">
                              <Upload className="w-12 h-12 text-white mx-auto mb-2" />
                              <p className="text-white font-semibold">
                                Thay đổi ảnh
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-6">
                          <Upload className="w-16 h-16 text-gray-400 mb-4" />
                          <p className="text-sm font-semibold text-gray-700 mb-1">
                            Click để tải ảnh lên
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG hoặc GIF (Max. 5MB)
                          </p>
                        </div>
                      )}
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={onSelectFile}
                      />
                    </label>

                    <p className="text-xs text-gray-500 mt-2">
                      Ảnh đại diện sẽ hiển thị cho khách hàng khi tìm kiếm nhà
                      hàng
                    </p>
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Quay lại
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creating ? (
                      <>
                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                        Đang tạo...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Hoàn tất đăng ký
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 rounded-r-xl p-4">
          <div className="flex items-start gap-3">
            <Store className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Lưu ý khi đăng ký:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>Thông tin đăng ký sẽ được xét duyệt trong 24h</li>
                <li>
                  Vị trí trên bản đồ phải chính xác để drone có thể giao hàng
                </li>
                <li>Ảnh đại diện nên rõ ràng, thu hút khách hàng</li>
                <li>Email và số điện thoại phải chính xác để nhận thông báo</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}