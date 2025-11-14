import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  Store,
  Phone,
  MapPin,
  FileText,
  DollarSign,
  Truck,
  Gauge,
  Upload,
  Save,
  Camera,
  CheckCircle,
  AlertCircle,
  Search,
  Navigation,
} from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

// Fix leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

// Component cập nhật view map khi position thay đổi
function MapUpdater({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView([position.lat, position.lng], 13);
    }
  }, [position, map]);
  return null;
}

export default function ProfilePage({ onUpdate }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [restaurant, setRestaurant] = useState({
    name: "",
    description: "",
    phone: "",
    address: "",
    minOrder: "",
    deliveryFee: "",
    maxDeliveryDistance: "",
    image: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [rid, setRid] = useState(localStorage.getItem("myRestaurantId") || "");

  // ✅ Map state
  const [position, setPosition] = useState({ lat: 21.0278, lng: 105.8342 });
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const token = localStorage.getItem("token");

  const ensureRestaurantId = async () => {
    if (rid) return rid;
    const cached = localStorage.getItem("myRestaurantId");
    if (cached) {
      setRid(cached);
      return cached;
    }
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const res = await fetch(
        `http://localhost:5000/api/restaurant/owner/${user.id || user._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const list = await res.json();
      if (!res.ok || !Array.isArray(list) || list.length === 0) {
        toast.info("Tài khoản này chưa có nhà hàng nào");
        return "";
      }
      const id = list[0]._id;
      localStorage.setItem("myRestaurantId", id);
      setRid(id);
      return id;
    } catch {
      return "";
    }
  };

  const loadProfile = async () => {
    setLoading(true);
    try {
      const id = await ensureRestaurantId();
      if (!id) {
        setRestaurant((p) => ({ ...p, _id: "" }));
        return;
      }

      const res = await fetch(`http://localhost:5000/api/restaurant/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Tải hồ sơ thất bại");

      setRestaurant({
        name: data.name || "",
        description: data.description || "",
        phone: data.phone || "",
        address: data.address || "",
        minOrder: data.minOrder || "",
        deliveryFee: data.deliveryFee || "",
        maxDeliveryDistance: data.maxDeliveryDistance || "",
        image: data.image || "",
        _id: data._id,
      });
      setImagePreview(data.image || null);

      // ✅ Load vị trí từ locationId
      if (data.locationId?.coords) {
        setPosition({
          lat: data.locationId.coords.lat,
          lng: data.locationId.coords.lng,
        });
      }
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Lỗi tải hồ sơ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // ✅ Tìm kiếm địa chỉ qua Nominatim
  const doSearch = async (q) => {
    if (!q) return setSuggestions([]);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          q
        )}&addressdetails=1&limit=5`
      );
      const list = await res.json();
      setSuggestions(list || []);
    } catch {
      setSuggestions([]);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => doSearch(query), 500);
    return () => clearTimeout(timer);
  }, [query]);

  async function reverseGeocode(lat, lng) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const j = await res.json();
      setRestaurant((p) => ({ ...p, address: j.display_name || p.address }));
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
    setRestaurant((p) => ({ ...p, address: s.display_name }));
    setSuggestions([]);
    setQuery("");
  };

  // ✅ Lưu thay đổi (bao gồm cả cập nhật location)
  const onSave = async () => {
    if (!restaurant._id) {
      toast.info("Chưa có hồ sơ nhà hàng để lưu");
      return;
    }
    setSaving(true);
    try {
      // 1) Cập nhật location (nếu đã có locationId)
      const resRestaurant = await fetch(`http://localhost:5000/api/restaurant/${restaurant._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const currentData = await resRestaurant.json();

      if (currentData.locationId?._id) {
        await fetch(`http://localhost:5000/api/location/${currentData.locationId._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            coords: { lat: position.lat, lng: position.lng },
            address: restaurant.address,
          }),
        });
      }

      // 2) Cập nhật restaurant
      const fd = new FormData();
      fd.append("name", restaurant.name);
      fd.append("description", restaurant.description);
      fd.append("phone", restaurant.phone);
      fd.append("address", restaurant.address);
      fd.append("minOrder", restaurant.minOrder);
      fd.append("deliveryFee", restaurant.deliveryFee);
      fd.append("maxDeliveryDistance", restaurant.maxDeliveryDistance);
      if (imageFile) fd.append("image", imageFile);

      const res = await fetch(`http://localhost:5000/api/restaurant/${restaurant._id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Lưu thất bại");

      toast.success("✅ Đã lưu thay đổi");

      if (typeof onUpdate === "function") {
        onUpdate(restaurant.name);
      }

      setImageFile(null);
      loadProfile();
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Lỗi lưu hồ sơ");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-orange-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Đang tải hồ sơ nhà hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Store className="w-7 h-7 text-orange-600" />
            Hồ sơ nhà hàng
          </h1>
          <p className="text-gray-600 mt-1">Cập nhật thông tin hiển thị cho khách hàng</p>
        </div>

        <button
          onClick={onSave}
          disabled={saving}
          className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              Đang lưu...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Lưu thay đổi
            </>
          )}
        </button>
      </div>

      {/* Status Banner */}
      {!restaurant._id ? (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-800">Chưa có hồ sơ nhà hàng</h3>
              <p className="text-yellow-700 text-sm mt-1">
                Tài khoản của bạn chưa có nhà hàng nào. Vui lòng liên hệ quản trị viên để đăng ký.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-800">Hồ sơ đã được kích hoạt</h3>
              <p className="text-green-700 text-sm mt-1">
                Nhà hàng của bạn đang hoạt động và hiển thị cho khách hàng.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Image */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5 text-orange-600" />
              Ảnh đại diện
            </h3>

            <div className="space-y-4">
              <div className="relative w-full aspect-square rounded-xl overflow-hidden border-2 border-gray-200 bg-gradient-to-br from-orange-50 to-red-50">
                {imagePreview ? (
                  <img src={imagePreview} alt="Restaurant" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <Store className="w-16 h-16 mb-2" />
                    <p className="text-sm">Chưa có ảnh</p>
                  </div>
                )}
              </div>

              <label className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 rounded-lg cursor-pointer hover:from-orange-200 hover:to-red-200 transition-all font-semibold">
                <Upload className="w-4 h-4" />
                Chọn ảnh mới
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>

              <p className="text-xs text-gray-500 text-center">JPG, PNG hoặc GIF (Max. 5MB)</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Thống kê nhanh</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm text-gray-600">Đơn tối thiểu</span>
                <span className="font-bold text-blue-600">
                  {Intl.NumberFormat("vi-VN").format(restaurant.minOrder || 0)}đ
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm text-gray-600">Phí giao hàng</span>
                <span className="font-bold text-green-600">
                  {Intl.NumberFormat("vi-VN").format(restaurant.deliveryFee || 0)}đ
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <span className="text-sm text-gray-600">Bán kính giao</span>
                <span className="font-bold text-orange-600">{restaurant.maxDeliveryDistance || 0} km</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Information Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-600" />
              Thông tin cơ bản
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tên nhà hàng <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="VD: Nhà hàng ABC"
                    value={restaurant.name}
                    onChange={(e) => setRestaurant((p) => ({ ...p, name: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Mô tả nhà hàng</label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  placeholder="Giới thiệu về nhà hàng của bạn..."
                  value={restaurant.description}
                  onChange={(e) => setRestaurant((p) => ({ ...p, description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="0123456789"
                      value={restaurant.phone}
                      onChange={(e) => setRestaurant((p) => ({ ...p, phone: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ✅ Location & Address với Map */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-orange-600" />
              Vị trí & Địa chỉ
            </h3>

            <div className="space-y-4">
              {/* Search Address */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tìm kiếm địa chỉ</label>
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
                  <div className="mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-48 overflow-auto z-20 absolute w-full">
                    {suggestions.map((s) => (
                      <div
                        key={s.place_id}
                        onClick={() => selectSuggestion(s)}
                        className="px-4 py-3 hover:bg-orange-50 cursor-pointer border-b last:border-b-0 transition-colors"
                      >
                        <p className="text-sm font-medium text-gray-800">{s.display_name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Map */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Chọn vị trí trên bản đồ</label>
                <div className="rounded-xl overflow-hidden border-2 border-gray-200 shadow-lg h-80 relative z-0">
                  <MapContainer center={[position.lat, position.lng]} zoom={13} style={{ height: "100%", width: "100%" }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[position.lat, position.lng]} />
                    <MapClickHandler />
                    <MapUpdater position={position} />
                  </MapContainer>
                </div>
                <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                  <Navigation className="w-4 h-4 text-orange-500" />
                  <span>
                    Tọa độ: {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
                  </span>
                </div>
              </div>

              {/* Address Detail */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Địa chỉ chi tiết <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  placeholder="Số nhà, tên đường, phường, quận..."
                  value={restaurant.address}
                  onChange={(e) => setRestaurant((p) => ({ ...p, address: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Delivery Configuration */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5 text-orange-600" />
              Cấu hình giao hàng
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Đơn tối thiểu</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    min="0"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="50000"
                    value={restaurant.minOrder}
                    onChange={(e) => setRestaurant((p) => ({ ...p, minOrder: e.target.value }))}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Giá trị đơn hàng tối thiểu (VNĐ)</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phí giao hàng</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    min="0"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="20000"
                    value={restaurant.deliveryFee}
                    onChange={(e) => setRestaurant((p) => ({ ...p, deliveryFee: e.target.value }))}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Chi phí vận chuyển (VNĐ)</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Bán kính giao hàng</label>
                <div className="relative">
                  <Gauge className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="5"
                    value={restaurant.maxDeliveryDistance}
                    onChange={(e) => setRestaurant((p) => ({ ...p, maxDeliveryDistance: e.target.value }))}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Tối đa (km)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}