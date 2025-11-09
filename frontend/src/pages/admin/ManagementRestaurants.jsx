import { useEffect, useState } from "react";
import {
  Search,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Store,
  RefreshCw,
  Plus,
  Image as ImageIcon,
  Lock,
  Unlock,
  Trash2,
} from "lucide-react";
import { toast } from "react-toastify";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  const token = localStorage.getItem("token");

  // ✅ Lấy danh sách nhà hàng
  const fetchRestaurants = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/restaurant`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error("Không thể tải danh sách nhà hàng");
      const data = await res.json();
      setRestaurants(Array.isArray(data) ? data : data.restaurants || []);
    } catch (err) {
      console.error("fetch restaurants", err);
      setError("Không thể tải nhà hàng. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  // ✅ Duyệt nhà hàng
  const approveRestaurant = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/restaurant/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "verified" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Duyệt thất bại");
      toast.success("✅ Duyệt nhà hàng thành công!");
      fetchRestaurants();
    } catch (e) {
      console.error(e);
      toast.error(`❌ ${e.message}`);
    }
  };

  // ✅ Xóa nhà hàng
  const deleteRestaurant = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa nhà hàng này? Hành động không thể hoàn tác.")) return;
    try {
      const res = await fetch(`${API_BASE}/api/restaurant/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Xóa nhà hàng thất bại");
      setRestaurants((prev) => prev.filter((r) => r._id !== id));
      toast.success("✅ Đã xóa nhà hàng");
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Lỗi xóa nhà hàng");
    }
  };

  // ✅ Khóa / Mở khóa nhà hàng
  const toggleRestaurantLock = async (r) => {
    const locked = r.status === "suspended";
    const endpoint = `${API_BASE}/api/restaurant/${r._id}/${locked ? "unlock" : "lock"}`;
    try {
      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Thao tác thất bại");
      setRestaurants((prev) => prev.map((x) => (x._id === r._id ? data.data : x)));
      toast.success(locked ? "Đã mở khóa nhà hàng" : "Đã khóa nhà hàng");
    } catch (e) {
      toast.error(e.message);
    }
  };

  const statusConfig = {
    verified: { color: "bg-green-100 text-green-800", border: "border-green-300", icon: CheckCircle, label: "Đã xác minh" },
    pending: { color: "bg-yellow-100 text-yellow-800", border: "border-yellow-300", icon: Clock, label: "Chờ duyệt" },
    suspended: { color: "bg-red-100 text-red-800", border: "border-red-300", icon: AlertCircle, label: "Tạm dừng" },
  };

  const filtered = restaurants.filter((r) => {
    const matchesSearch =
      !search ||
      r.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.email?.toLowerCase().includes(search.toLowerCase()) ||
      r.address?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || r.status === filter;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: restaurants.length,
    verified: restaurants.filter((r) => r.status === "verified").length,
    pending: restaurants.filter((r) => r.status === "pending").length,
    suspended: restaurants.filter((r) => r.status === "suspended").length,
  };

  const filterOptions = [
    { value: "all", label: "Tất cả", count: stats.total },
    { value: "verified", label: "Đã xác minh", count: stats.verified },
    { value: "pending", label: "Chờ duyệt", count: stats.pending },
    { value: "suspended", label: "Tạm dừng", count: stats.suspended },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
              <Store className="w-6 h-6 text-white" />
            </div>
            Quản lý Nhà hàng
          </h1>
          <p className="text-gray-600 mt-1">Quản lý và xét duyệt các nhà hàng trong hệ thống</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchRestaurants}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Tải lại
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:shadow-lg transition-all">
            <Plus className="w-4 h-4" />
            Thêm mới
          </button>
        </div>
      </div>

      {/* Bộ lọc & tìm kiếm */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium border ${
                filter === opt.value
                  ? "bg-orange-500 text-white border-orange-500"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {opt.label} ({opt.count})
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Tìm kiếm nhà hàng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
          />
        </div>
      </div>

      {/* Danh sách */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div className="animate-spin h-12 w-12 border-4 border-orange-600 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-600">Đang tải danh sách nhà hàng...</p>
            </div>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-red-600 font-semibold">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-600">Không tìm thấy nhà hàng nào.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filtered.map((restaurant) => {
              const cfg = statusConfig[restaurant.status] || statusConfig.pending;
              const Icon = cfg.icon;

              return (
                <div
                  key={restaurant._id}
                  className="bg-white border-2 border-gray-200 rounded-xl hover:shadow-xl hover:border-orange-300 transition-all duration-200"
                >
                  {/* Hình ảnh */}
                  <div className="relative h-48 bg-gray-100 rounded-t-xl overflow-hidden">
                    {restaurant.image ? (
                      <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-16 h-16 text-gray-300" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${cfg.color} ${cfg.border}`}>
                        <Icon className="w-3.5 h-3.5" />
                        {cfg.label}
                      </span>
                    </div>
                  </div>

                  {/* Nội dung */}
                  <div className="p-4 space-y-3">
                    <h3 className="text-lg font-bold text-gray-800">{restaurant.name}</h3>
                    <p className="text-gray-500 text-sm line-clamp-2">{restaurant.address || "Chưa cập nhật địa chỉ"}</p>

                    <div className="flex gap-2 pt-3">
                      <button
                        onClick={() => setSelectedRestaurant(restaurant)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        Xem
                      </button>

                      {restaurant.status === "pending" && (
                        <button
                          onClick={() => approveRestaurant(restaurant._id)}
                          className="px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Duyệt
                        </button>
                      )}

                      <button
                        onClick={() => toggleRestaurantLock(restaurant)}
                        className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                          restaurant.status === "suspended"
                            ? "bg-green-50 hover:bg-green-100 text-green-700"
                            : "bg-red-50 hover:bg-red-100 text-red-600"
                        }`}
                      >
                        {restaurant.status === "suspended" ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        {restaurant.status === "suspended" ? "Mở khóa" : "Khóa"}
                      </button>

                      <button
                        onClick={() => deleteRestaurant(restaurant._id)}
                        className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
