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
  Plus,
  Package,
  Navigation,
} from "lucide-react";

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
    active: { color: "bg-green-100 text-green-700 border border-green-200", icon: CheckCircle, label: "Hoạt động" },
    idle: { color: "bg-blue-100 text-blue-700 border border-blue-200", icon: Clock, label: "Chờ sẵn" },
    maintenance: { color: "bg-yellow-100 text-yellow-700 border border-yellow-200", icon: Wrench, label: "Bảo trì" },
    returning: { color: "bg-purple-100 text-purple-700 border border-purple-200", icon: Plane, label: "Đang về" },
    offline: { color: "bg-red-100 text-red-700 border border-red-200", icon: XCircle, label: "Offline" },
  };

  const filtered = drones.filter((d) => {
    const matchesSearch = !search || d.code?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || d.status === filter;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: drones.length,
    active: drones.filter((d) => d.status === "active").length,
    idle: drones.filter((d) => d.status === "idle").length,
    maintenance: drones.filter((d) => d.status === "maintenance").length,
    offline: drones.filter((d) => d.status === "offline").length,
    avgBattery:
      drones.length > 0
        ? Math.round(drones.reduce((sum, d) => sum + (d.batteryLevel ?? 0), 0) / drones.length)
        : 0,
  };

  const filterOptions = [
    { value: "all", label: "Tất cả", count: stats.total },
    { value: "active", label: "Đang hoạt động", count: stats.active },
    { value: "idle", label: "Chờ sẵn", count: stats.idle },
    { value: "maintenance", label: "Bảo trì", count: stats.maintenance },
    { value: "offline", label: "Offline", count: stats.offline },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Quản lý Drone</h1>
          <p className="text-gray-600 mt-1">Giám sát và điều khiển drone giao hàng</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Tải lại
          </button>
        </div>
      </div>

      {/* Stats Cards - Đơn giản hơn */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng số Drone</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{stats.total}</p>
            </div>
            <Plane className="w-8 h-8 text-gray-500" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Đang hoạt động</p>
              <p className="text-2xl font-bold text-green-700 mt-1">{stats.active}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Chờ sẵn</p>
              <p className="text-2xl font-bold text-blue-700 mt-1">{stats.idle}</p>
            </div>
            <Clock className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pin trung bình</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{stats.avgBattery}%</p>
            </div>
            <Zap className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm drone theo mã..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-4 py-2 rounded-md text-sm font-medium border transition ${
                  filter === f.value
                    ? "bg-blue-100 text-blue-700 border-blue-300"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {f.label} ({f.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Drone List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-600">Đang tải danh sách drone...</p>
            </div>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-semibold">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Không tìm thấy drone nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filtered.map((drone) => {
              const cfg = statusConfig[drone.status] || statusConfig.idle;
              const Icon = cfg.icon;
              const batteryColor =
                drone.batteryLevel >= 70 ? "bg-green-500" : drone.batteryLevel >= 30 ? "bg-yellow-500" : "bg-red-500";
              const loadPercentage = ((drone.currentLoad ?? 0) / (drone.capacity || 1)) * 100;

              return (
                <div
                  key={drone._id}
                  className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  {/* Header */}
                  <div className="bg-gray-50 border-b border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Plane className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">{drone.name || drone.code}</h3>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium mt-1 ${cfg.color}`}>
                            <Icon className="w-3.5 h-3.5" />
                            {cfg.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4 space-y-4">
                    {/* Battery & Load */}
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Pin</span>
                          <span className="font-medium">{drone.batteryLevel ?? 0}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${batteryColor}`}
                            style={{ width: `${drone.batteryLevel ?? 0}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Tải trọng</span>
                          <span className="font-medium">
                            {drone.currentLoad ?? 0}/{drone.capacity ?? 0}kg
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-blue-600 transition-all"
                            style={{ width: `${loadPercentage}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {drone.currentOrder && (
                      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Package className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-blue-700">{drone.currentOrder}</span>
                        </div>
                      </div>
                    )}

                    <div className="pt-3 border-t border-gray-200 space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{drone.location || "Không xác định"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 text-xs">
                        <Activity className="w-4 h-4" />
                        <span>Cập nhật: {drone.lastUpdated || "N/A"}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-3">
                      <button
                        onClick={() => setSelectedDrone(drone)}
                        className="flex-1 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md font-medium transition"
                      >
                        Chi tiết
                      </button>
                      <button className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-md transition">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-md transition">
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

      {/* Modal Chi tiết Drone */}
      {selectedDrone && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setSelectedDrone(null)}
        >
          <div
            className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800">Chi tiết Drone</h3>
                <button
                  onClick={() => setSelectedDrone(null)}
                  className="p-2 hover:bg-gray-100 rounded-md"
                >
                  <XCircle className="w-6 h-6 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <pre className="text-sm bg-gray-50 p-4 rounded-md overflow-auto text-gray-700">
                {JSON.stringify(selectedDrone, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}