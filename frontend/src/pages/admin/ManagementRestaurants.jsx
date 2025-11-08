import { useEffect, useState } from "react";
import {
  Search,
  Eye,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Store,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  Package,
  Calendar,
  MoreVertical,
  RefreshCw,
  Download,
  Plus,
  Star,
  TrendingUp,
  Image as ImageIcon,
  X,
} from "lucide-react";

// ✅ Khai báo API base từ biến môi trường (hoặc mặc định localhost)
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showActions, setShowActions] = useState(null);

  useEffect(() => {
    let mounted = true;
    const token = localStorage.getItem("token");

    const fetchRests = async () => {
      setLoading(true);
      setError(null);
      try {
        // ✅ Dùng API_BASE
        const res = await fetch(`${API_BASE}/api/restaurant`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!mounted) return;

        if (!res.ok) {
          setRestaurants([]);
          return;
        }

        const data = await res.json();
        setRestaurants(Array.isArray(data) ? data : data.restaurants || []);
      } catch (err) {
        console.error("fetch restaurants", err);
        setError("Failed to load restaurants");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchRests();
    return () => {
      mounted = false;
    };
  }, []);

  const statusConfig = {
    verified: {
      color: "bg-green-100 text-green-800",
      border: "border-green-300",
      icon: CheckCircle,
      gradient: "from-green-500 to-emerald-600",
    },
    pending: {
      color: "bg-yellow-100 text-yellow-800",
      border: "border-yellow-300",
      icon: Clock,
      gradient: "from-yellow-500 to-orange-500",
    },
    suspended: {
      color: "bg-red-100 text-red-800",
      border: "border-red-300",
      icon: AlertCircle,
      gradient: "from-red-500 to-red-600",
    },
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

  // ✅ Calculate stats
  const stats = {
    total: restaurants.length,
    verified: restaurants.filter((r) => r.status === "verified").length,
    pending: restaurants.filter((r) => r.status === "pending").length,
    suspended: restaurants.filter((r) => r.status === "suspended").length,
    totalRevenue: restaurants.reduce((sum, r) => sum + (r.revenue || 0), 0),
    totalOrders: restaurants.reduce((sum, r) => sum + (r.orders || 0), 0),
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
          <p className="text-gray-600 mt-1">
            Quản lý và xét duyệt nhà hàng trong hệ thống
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.location.reload()}
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Store className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold">{stats.total}</span>
          </div>
          <p className="text-orange-100 text-sm">Tổng nhà hàng</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold">{stats.verified}</span>
          </div>
          <p className="text-green-100 text-sm">Đã xác minh</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold">{stats.pending}</span>
          </div>
          <p className="text-yellow-100 text-sm">Chờ duyệt</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold">
              ${(stats.totalRevenue / 1000).toFixed(0)}K
            </span>
          </div>
          <p className="text-blue-100 text-sm">Tổng doanh thu</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                placeholder="Tìm kiếm nhà hàng theo tên, email, địa chỉ..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Status Filters */}
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                  filter === f.value
                    ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span>{f.label}</span>
                <span
                  className={`ml-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                    filter === f.value
                      ? "bg-white/20 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {f.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Restaurants Grid */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Store className="w-5 h-5 text-orange-600" />
              Danh sách nhà hàng ({filtered.length})
            </h2>
            <p className="text-sm text-gray-600">
              Hiển thị {filtered.length} / {restaurants.length} nhà hàng
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div className="animate-spin h-12 w-12 border-4 border-orange-600 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-600">Đang tải nhà hàng...</p>
            </div>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-semibold">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Không tìm thấy nhà hàng</p>
            <p className="text-gray-400 text-sm mt-1">
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filtered.map((restaurant) => {
              const statusCfg =
                statusConfig[restaurant.status] || statusConfig.pending;
              const Icon = statusCfg.icon;

              return (
                <div
                  key={restaurant._id || restaurant.id}
                  className="bg-white border-2 border-gray-200 rounded-xl hover:shadow-xl hover:border-orange-300 transition-all duration-200"
                >
                  {/* Image Header */}
                  <div className="relative h-48 bg-gradient-to-br from-orange-100 to-red-100 rounded-t-xl overflow-hidden">
                    {restaurant.image ? (
                      <img
                        src={restaurant.image}
                        alt={restaurant.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-16 h-16 text-orange-300" />
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-sm ${statusCfg.color} ${statusCfg.border}`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {restaurant.status === "verified"
                          ? "Đã xác minh"
                          : restaurant.status === "pending"
                          ? "Chờ duyệt"
                          : "Tạm dừng"}
                      </span>
                    </div>

                    {/* Actions Dropdown */}
                    <div className="absolute top-3 right-3">
                      <button
                        onClick={() =>
                          setShowActions(
                            showActions === restaurant._id ? null : restaurant._id
                          )
                        }
                        className="p-2 bg-white/90 backdrop-blur-sm hover:bg-white rounded-lg transition-colors shadow-md"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-700" />
                      </button>

                      {showActions === restaurant._id && (
                        <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-10 min-w-[150px]">
                          <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 w-full text-left text-sm">
                            <Eye className="w-4 h-4 text-blue-600" />
                            <span>Xem chi tiết</span>
                          </button>
                          <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 w-full text-left text-sm">
                            <Edit2 className="w-4 h-4 text-orange-600" />
                            <span>Chỉnh sửa</span>
                          </button>
                          {restaurant.status === "pending" && (
                            <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 w-full text-left text-sm">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span>Duyệt</span>
                            </button>
                          )}
                          <hr className="my-2" />
                          <button className="flex items-center gap-2 px-4 py-2 hover:bg-red-50 w-full text-left text-sm text-red-600">
                            <Trash2 className="w-4 h-4" />
                            <span>Xóa</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Rating Badge */}
                    {restaurant.rating && (
                      <div className="absolute bottom-3 right-3">
                        <div className="flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg shadow-md">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-semibold text-gray-800">
                            {restaurant.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-4 space-y-4">
                    {/* Name */}
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-1">
                        {restaurant.name}
                      </h3>
                      {restaurant.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {restaurant.description}
                        </p>
                      )}
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2">
                      {restaurant.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="truncate">{restaurant.email}</span>
                        </div>
                      )}
                      {restaurant.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{restaurant.phone}</span>
                        </div>
                      )}
                      {restaurant.address && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="line-clamp-1">{restaurant.address}</span>
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Package className="w-4 h-4 text-blue-600" />
                          <span className="text-xs text-gray-600">Đơn hàng</span>
                        </div>
                        <p className="text-lg font-bold text-blue-600">
                          {restaurant.orders ?? 0}
                        </p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <span className="text-xs text-gray-600">Doanh thu</span>
                        </div>
                        <p className="text-lg font-bold text-green-600">
                          ${(restaurant.revenue ?? 0).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Join Date */}
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>
                          Tham gia:{" "}
                          {restaurant.joinDate ||
                            restaurant.createdAt?.slice(0, 10) ||
                            "-"}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-3">
                      <button
                        onClick={() => setSelectedRestaurant(restaurant)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        Xem
                      </button>
                      <button className="px-4 py-2.5 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Restaurant Detail Modal */}
      {selectedRestaurant && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setSelectedRestaurant(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-800">
                  Chi tiết nhà hàng
                </h3>
                <button
                  onClick={() => setSelectedRestaurant(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <pre className="text-sm bg-gray-50 p-4 rounded-lg overflow-auto">
                {JSON.stringify(selectedRestaurant, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}