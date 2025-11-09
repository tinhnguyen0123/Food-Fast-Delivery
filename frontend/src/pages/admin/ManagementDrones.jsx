import { useEffect, useState } from "react";
import {
  Search,
  Zap,
  Gauge,
  Weight,
  MapPin,
  Edit2,
  Plane,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Wrench,
  XCircle,
  RefreshCw,
  Download,
  Plus,
  TrendingUp,
  Package,
  Navigation,
} from "lucide-react";

// ✅ Khai báo API base từ biến môi trường (hoặc mặc định localhost)
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function DronesPage() {
  const [drones, setDrones] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDrone, setSelectedDrone] = useState(null);

  useEffect(() => {
    let mounted = true;
    const token = localStorage.getItem("token");

    const fetchDrones = async () => {
      setLoading(true);
      setError(null);
      try {
        // ✅ Dùng API_BASE
        const res = await fetch(`${API_BASE}/api/drone`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!mounted) return;
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to fetch drones");
        }
        const data = await res.json();
        if (mounted) {
          setDrones(Array.isArray(data) ? data : data.drones || []);
        }
      } catch (err) {
        if (mounted) {
          console.error("fetch drones", err);
          setError(err.message || "Failed to load drones");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchDrones();
    return () => {
      mounted = false;
    };
  }, []);

  const statusConfig = {
    active: {
      color: "bg-green-100 text-green-800",
      border: "border-green-300",
      icon: CheckCircle,
      gradient: "from-green-500 to-emerald-600",
    },
    idle: {
      color: "bg-blue-100 text-blue-800",
      border: "border-blue-300",
      icon: Clock,
      gradient: "from-blue-500 to-indigo-600",
    },
    maintenance: {
      color: "bg-yellow-100 text-yellow-800",
      border: "border-yellow-300",
      icon: Wrench,
      gradient: "from-yellow-500 to-orange-500",
    },
    offline: {
      color: "bg-red-100 text-red-800",
      border: "border-red-300",
      icon: XCircle,
      gradient: "from-red-500 to-red-600",
    },
  };

  const filtered = drones.filter((d) => {
    const matchesSearch =
      !search ||
      (d.code?.toLowerCase().includes(search.toLowerCase()));
    const matchesFilter = filter === "all" || d.status === filter;
    return matchesSearch && matchesFilter;
  });

  // ✅ Calculate stats
  const stats = {
    total: drones.length,
    active: drones.filter((d) => d.status === "active").length,
    idle: drones.filter((d) => d.status === "idle").length,
    maintenance: drones.filter((d) => d.status === "maintenance").length,
    offline: drones.filter((d) => d.status === "offline").length,
    avgBattery:
      drones.length > 0
        ? Math.round(
            drones.reduce((sum, d) => sum + (d.batteryLevel ?? 0), 0) / drones.length
          )
        : 0,
  };

  const filterOptions = [
    { value: "all", label: "Tất cả", count: stats.total },
    { value: "active", label: "Đang hoạt động", count: stats.active },
    { value: "idle", label: "Chờ sẵn", count: stats.idle },
    { value: "maintenance", label: "Bảo trì", count: stats.maintenance },
    { value: "offline", label: "Offline", count: stats.offline },
  ];

  const displayDrones = filtered;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Plane className="w-6 h-6 text-white" />
            </div>
            Quản lý Drone
          </h1>
          <p className="text-gray-600 mt-1">
            Giám sát và điều khiển drone giao hàng
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
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all">
            <Plus className="w-4 h-4" />
            Thêm Drone
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Plane className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold">{stats.total}</span>
          </div>
          <p className="text-indigo-100 text-sm">Tổng số Drone</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold">{stats.active}</span>
          </div>
          <p className="text-green-100 text-sm">Đang hoạt động</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold">{stats.idle}</span>
          </div>
          <p className="text-blue-100 text-sm">Chờ sẵn</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold">{stats.avgBattery}%</span>
          </div>
          <p className="text-yellow-100 text-sm">Pin trung bình</p>
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
                placeholder="Tìm kiếm drone theo ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
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

      {/* Drones Grid */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Plane className="w-5 h-5 text-indigo-600" />
              Danh sách Drone ({displayDrones.length})
            </h2>
            <p className="text-sm text-gray-600">
              Hiển thị {displayDrones.length} drone
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-600">Đang tải drone...</p>
            </div>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-semibold">{error}</p>
          </div>
        ) : displayDrones.length === 0 ? (
          <div className="p-12 text-center">
            <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Không tìm thấy drone</p>
            <p className="text-gray-400 text-sm mt-1">
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {displayDrones.map((drone) => {
              const statusCfg = statusConfig[drone.status] || statusConfig.idle;
              const Icon = statusCfg.icon;
              const batteryColor =
                drone.batteryLevel >= 70
                  ? "bg-green-500"
                  : drone.batteryLevel >= 30
                  ? "bg-yellow-500"
                  : "bg-red-500";
              const loadPercentage =
                ((drone.currentLoad ?? 0) / (drone.capacity || 1)) * 100;

              return (
                <div
                  key={drone._id || drone.id}
                  className="bg-white border-2 border-gray-200 rounded-xl hover:shadow-xl hover:border-indigo-300 transition-all duration-200"
                >
                  {/* Header */}
                  <div
                    className={`bg-gradient-to-r ${statusCfg.gradient} p-4 rounded-t-xl`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                          <Plane className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-bold text-lg">
                            {drone.name || drone.code}
                          </h3>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border backdrop-blur-sm ${statusCfg.color} ${statusCfg.border}`}
                          >
                            <Icon className="w-3 h-3" />
                            {drone.status === "active"
                              ? "Hoạt động"
                              : drone.status === "idle"
                              ? "Chờ sẵn"
                              : drone.status === "maintenance"
                              ? "Bảo trì"
                              : "Offline"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4 space-y-4">
                    {/* Battery & Load */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-600 flex items-center gap-1 font-medium">
                            <Zap className="w-3.5 h-3.5" />
                            Pin
                          </span>
                          <span className="text-sm font-bold text-gray-800">
                            {drone.batteryLevel ?? 0}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${batteryColor} transition-all`}
                            style={{ width: `${drone.batteryLevel ?? 0}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-600 flex items-center gap-1 font-medium">
                            <Weight className="w-3.5 h-3.5" />
                            Tải
                          </span>
                          <span className="text-sm font-bold text-gray-800">
                            {drone.currentLoad ?? 0}/{drone.capacity ?? 0}kg
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${loadPercentage}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Current Order */}
                    {drone.currentOrder && (
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <div className="flex items-center gap-2 mb-1">
                          <Package className="w-4 h-4 text-blue-600" />
                          <p className="text-xs text-gray-600 font-medium">
                            Đơn hàng hiện tại
                          </p>
                        </div>
                        <p className="text-sm font-bold text-blue-700">
                          {drone.currentOrder}
                        </p>
                      </div>
                    )}

                    {/* Location */}
                    <div className="pt-3 border-t border-gray-200 space-y-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <p className="text-xs text-gray-600 font-medium">
                            Vị trí
                          </p>
                        </div>
                        <p className="text-sm text-gray-800 font-medium">
                          {drone.location || "Unknown"}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Activity className="w-4 h-4 text-gray-400" />
                          <p className="text-xs text-gray-600 font-medium">
                            Cập nhật lần cuối
                          </p>
                        </div>
                        <p className="text-sm text-gray-600">
                          {drone.lastUpdated || "N/A"}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-3">
                      <button
                        onClick={() => setSelectedDrone(drone)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors font-medium"
                      >
                        <Gauge className="w-4 h-4" />
                        Chi tiết
                      </button>
                      <button className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="px-4 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-lg transition-colors">
                        <Navigation className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Drone Detail Modal */}
      {selectedDrone && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setSelectedDrone(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Plane className="w-6 h-6 text-indigo-600" />
                  Chi tiết Drone
                </h3>
                <button
                  onClick={() => setSelectedDrone(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircle className="w-6 h-6 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <pre className="text-sm bg-gray-50 p-4 rounded-lg overflow-auto">
                {JSON.stringify(selectedDrone, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}