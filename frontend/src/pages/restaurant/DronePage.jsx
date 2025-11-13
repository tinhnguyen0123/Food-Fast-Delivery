import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  Plane,
  Battery,
  Package,
  Clock,
  MapPin,
  Plus,
  RefreshCw,
  Zap,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  X
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function DronesPage() {
  const [drones, setDrones] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rid, setRid] = useState(localStorage.getItem("myRestaurantId") || "");
  const [showAdd, setShowAdd] = useState(false);
  const [newDrone, setNewDrone] = useState({
    code: "",
    name: "",
    batteryLevel: 100,
    capacity: 5,
  });

  const token = localStorage.getItem("token");

  // ✅ Lấy hoặc tạo myRestaurantId
  const ensureRestaurantId = async () => {
    if (rid) return rid;
    const cached = localStorage.getItem("myRestaurantId");
    if (cached) {
      setRid(cached);
      return cached;
    }
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const res = await fetch(`${API_BASE}/api/restaurant/owner/${user.id || user._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const list = await res.json();
      if (!res.ok || !Array.isArray(list) || list.length === 0) return "";
      const id = list[0]._id;
      setRid(id);
      localStorage.setItem("myRestaurantId", id);
      return id;
    } catch (error) {
      console.error(error);
      return "";
    }
  };

  // ✅ Tải danh sách drone và đơn hàng cần giao
  const loadData = async () => {
    setLoading(true);
    try {
      const id = await ensureRestaurantId();
      if (!id) throw new Error("Không tìm thấy nhà hàng");

      // ✅ Lấy drone theo nhà hàng
      const droneRes = await fetch(`${API_BASE}/api/drone/restaurant/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const droneData = await droneRes.json();
      if (!droneRes.ok) throw new Error(droneData.message || "Tải drone thất bại");
      setDrones(Array.isArray(droneData) ? droneData : droneData.drones || []);

      // ✅ Lấy đơn hàng thuộc nhà hàng này và chỉ lấy status = "ready"
      const orderRes = await fetch(`${API_BASE}/api/order/restaurant/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.message || "Tải đơn chờ gán thất bại");

      const orders = Array.isArray(orderData) ? orderData : orderData.orders || [];
      const ready = orders.filter((o) => o.status === "ready"); // ✅ chỉ lấy "ready"
      setPendingOrders(ready);
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const idleDrones = drones.filter((d) => d.status === "idle");
  const activeDrones = drones.filter((d) => d.status === "delivering" || d.status === "charging");

  // ✅ Gán drone thủ công
  const assignDrone = async (droneId, orderId) => {
    try {
      const res = await fetch(`${API_BASE}/api/drone/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ droneId, orderId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gán drone thất bại");

      toast.success(" Đã gán drone cho đơn hàng!");
      setPendingOrders((prev) => prev.filter((o) => o._id !== orderId));
      setDrones((prev) => prev.map((d) => (d._id === droneId ? { ...d, status: "delivering" } : d)));
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Lỗi gán drone");
    }
  };

  // ✅ Phân bổ tự động
  const autoAssign = async () => {
    try {
      const id = await ensureRestaurantId();
      if (!id) {
        toast.error("Không xác định được nhà hàng");
        return;
      }
      const res = await fetch(`${API_BASE}/api/drone/auto-assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ restaurantId: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Phân bổ tự động thất bại");
      toast.success(` Đã gán ${data.assigned} đơn cho drone`);
      await loadData();
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Lỗi phân bổ tự động");
    }
  };

  // ✅ Tạo drone mới
  const createDrone = async () => {
    if (!newDrone.code) {
      toast.error("Nhập mã drone (code)");
      return;
    }
    try {
      const payload = {
        code: newDrone.code,
        name: newDrone.name,
        batteryLevel: Number(newDrone.batteryLevel ?? 100),
        capacity: Number(newDrone.capacity ?? 5),
        restaurantId: rid || (await ensureRestaurantId()),
      };

      const res = await fetch(`${API_BASE}/api/drone`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Tạo drone thất bại");

      toast.success(" Đã tạo drone");
      setShowAdd(false);
      setNewDrone({ code: "", name: "", batteryLevel: 100, capacity: 5 });
      await loadData();
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Lỗi tạo drone");
    }
  };

  // Helper functions
  const getStatusBadge = (status) => {
    const badges = {
      idle: { color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle, text: "Sẵn sàng" },
      delivering: { color: "bg-blue-100 text-blue-700 border-blue-200", icon: Plane, text: "Đang giao" },
      charging: { color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Battery, text: "Đang sạc" },
      maintenance: { color: "bg-red-100 text-red-700 border-red-200", icon: AlertCircle, text: "Bảo trì" },
    };
    return badges[status] || badges.idle;
  };

  const getBatteryColor = (level) => {
    if (level >= 70) return "text-green-600";
    if (level >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Đang tải thông tin drone...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Drone</h1>
          <p className="text-gray-600 mt-1">Theo dõi trạng thái và gán đơn cho drone</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Thêm Drone
          </button>
          <button
            onClick={autoAssign}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Tự động phân bổ
          </button>
          <button
            onClick={loadData}
            className="bg-white border-2 border-gray-300 text-gray-700 px-4 py-2 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Tải lại
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1">Tổng drone</p>
              <p className="text-3xl font-bold">{drones.length}</p>
            </div>
            <Plane className="w-12 h-12 text-white/30" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm mb-1">Sẵn sàng</p>
              <p className="text-3xl font-bold">{idleDrones.length}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-white/30" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm mb-1">Đang hoạt động</p>
              <p className="text-3xl font-bold">{activeDrones.length}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-white/30" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm mb-1">Đơn chờ gán</p>
              <p className="text-3xl font-bold">{pendingOrders.length}</p>
            </div>
            <Clock className="w-12 h-12 text-white/30" />
          </div>
        </div>
      </div>

      {/* Add Drone Form */}
      {showAdd && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Plus className="w-6 h-6 text-purple-600" />
              Thêm Drone mới
            </h3>
            <button
              onClick={() => setShowAdd(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mã drone <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="VD: DRN001"
                value={newDrone.code}
                onChange={(e) => setNewDrone((p) => ({ ...p, code: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tên hiển thị
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="VD: Drone Xanh"
                value={newDrone.name}
                onChange={(e) => setNewDrone((p) => ({ ...p, name: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Pin (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="100"
                value={newDrone.batteryLevel}
                onChange={(e) => setNewDrone((p) => ({ ...p, batteryLevel: Number(e.target.value) }))}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tải tối đa (kg)
              </label>
              <input
                type="number"
                min="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="5"
                value={newDrone.capacity}
                onChange={(e) => setNewDrone((p) => ({ ...p, capacity: Number(e.target.value) }))}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setShowAdd(false)}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={createDrone}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
            >
              Tạo Drone
            </button>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Orders */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Clock className="w-6 h-6" />
              Đơn hàng chờ gán ({pendingOrders.length})
            </h3>
          </div>

          <div className="p-4">
            {pendingOrders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Không có đơn hàng chờ gán</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {pendingOrders.map((order) => (
                  <div
                    key={order._id}
                    className="border-2 border-gray-200 rounded-xl p-4 hover:border-orange-300 transition-all"
                  >
                    {/* Order Header */}
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-bold text-gray-800">
                          Đơn #{order._id.slice(-8)}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                          <MapPin className="w-4 h-4" />
                          {order.shippingAddress?.text || "Địa chỉ không rõ"}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                        Chờ gán
                      </span>
                    </div>

                    {/* Available Drones */}
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-2">
                        Drone khả dụng:
                      </p>
                      {idleDrones.length === 0 ? (
                        <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                          Không có drone sẵn sàng
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 gap-2">
                          {idleDrones.map((drone) => (
                            <button
                              key={drone._id}
                              onClick={() => assignDrone(drone._id, order._id)}
                              className="w-full bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border-2 border-green-200 rounded-lg p-3 text-left transition-all duration-200 hover:shadow-md"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-semibold text-gray-800">
                                    {drone.name || `Drone ${drone._id.slice(-4)}`}
                                  </p>
                                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                                    <span className="flex items-center gap-1">
                                      <Battery className="w-3 h-3" />
                                      {drone.batteryLevel || 0}%
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Package className="w-3 h-3" />
                                      {drone.currentLoad || 0}/{drone.capacity || 0}kg
                                    </span>
                                  </div>
                                </div>
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* All Drones */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Plane className="w-6 h-6" />
              Danh sách Drone ({drones.length})
            </h3>
          </div>

          <div className="p-4">
            {drones.length === 0 ? (
              <div className="text-center py-12">
                <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Chưa có drone nào</p>
                <button
                  onClick={() => setShowAdd(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 inline-flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Thêm drone đầu tiên
                </button>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {drones.map((drone) => {
                  const badge = getStatusBadge(drone.status);
                  const BadgeIcon = badge.icon;
                  const batteryColor = getBatteryColor(drone.batteryLevel || 0);

                  return (
                    <div
                      key={drone._id}
                      className="border-2 border-gray-200 rounded-xl p-4 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                            <Plane className="w-6 h-6 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">
                              {drone.name || `Drone ${drone._id.slice(-4)}`}
                            </p>
                            <p className="text-xs text-gray-500">
                              Mã: {drone.code || drone._id.slice(-8)}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border-2 ${badge.color}`}
                        >
                          <BadgeIcon className="w-3 h-3" />
                          {badge.text}
                        </span>
                      </div>

                      {/* Drone Stats */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Battery className={`w-4 h-4 ${batteryColor}`} />
                            <span className="text-xs text-gray-600">Pin</span>
                          </div>
                          <p className={`text-lg font-bold ${batteryColor}`}>
                            {drone.batteryLevel || 0}%
                          </p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Package className="w-4 h-4 text-blue-600" />
                            <span className="text-xs text-gray-600">Tải trọng</span>
                          </div>
                          <p className="text-lg font-bold text-blue-600">
                            {drone.currentLoad || 0}/{drone.capacity || 0}kg
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
