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
  X,
  Search,
  SortAsc,
  SortDesc
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
  const [droneSearch, setDroneSearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedOrderForAssign, setSelectedOrderForAssign] = useState(null);

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
      setShowAssignModal(false);
      setSelectedOrderForAssign(null);
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
      idle: { color: "bg-green-100 text-green-800", text: "Sẵn sàng" },
      delivering: { color: "bg-blue-100 text-blue-800", text: "Đang giao" },
      returning: { color: "bg-purple-100 text-purple-800", text: "Đang quay về" },
      charging: { color: "bg-yellow-100 text-yellow-800", text: "Đang sạc" },
      maintenance: { color: "bg-red-100 text-red-800", text: "Bảo trì" },
    };
    return badges[status] || badges.idle;
  };

  const getBatteryColor = (level) => {
    if (level >= 70) return "text-green-600";
    if (level >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const filteredPendingOrders = pendingOrders.filter((o) => {
    const q = orderSearch.toLowerCase();
    return (
      o._id.toLowerCase().includes(q) ||
      (o.shippingAddress?.text || "").toLowerCase().includes(q)
    );
  });

  const filteredAndSortedDrones = drones
    .filter((d) => {
      const q = droneSearch.toLowerCase();
      return (
        (d.name || "").toLowerCase().includes(q) ||
        (d.code || "").toLowerCase().includes(q) ||
        d._id.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      let compare = 0;
      if (sortBy === "name") compare = (a.name || "").localeCompare(b.name || "");
      if (sortBy === "batteryLevel") compare = (a.batteryLevel || 0) - (b.batteryLevel || 0);
      if (sortBy === "capacity") compare = (a.capacity || 0) - (b.capacity || 0);
      if (sortBy === "status") compare = (a.status || "").localeCompare(b.status || "");
      return sortOrder === "asc" ? compare : -compare;
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Đang tải thông tin drone...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-lg shadow-md">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Plane className="w-7 h-7 text-blue-600" />
            Quản lý Drone
          </h1>
          <p className="text-gray-600 mt-1">Theo dõi trạng thái và gán đơn cho drone như trên nền tảng thương mại điện tử</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:shadow-lg transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            Thêm Drone
          </button>
          <button
            onClick={autoAssign}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:shadow-lg transition-all duration-200"
          >
            <Zap className="w-4 h-4" />
            Tự động phân bổ
          </button>
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-md font-semibold hover:bg-gray-50 transition-all duration-200"
          >
            <RefreshCw className="w-4 h-4" />
            Tải lại
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Tổng drone</p>
              <p className="text-3xl font-bold text-gray-800">{drones.length}</p>
            </div>
            <Plane className="w-12 h-12 text-gray-300" />
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Sẵn sàng</p>
              <p className="text-3xl font-bold text-green-600">{idleDrones.length}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-gray-300" />
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Đang hoạt động</p>
              <p className="text-3xl font-bold text-blue-600">{activeDrones.length}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-gray-300" />
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Đơn chờ gán</p>
              <p className="text-3xl font-bold text-orange-600">{pendingOrders.length}</p>
            </div>
            <Clock className="w-12 h-12 text-gray-300" />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Orders */}
        <div>
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm đơn hàng..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đơn hàng ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Địa chỉ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPendingOrders.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                      Không có đơn hàng chờ gán
                    </td>
                  </tr>
                ) : (
                  filteredPendingOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50 transition-all">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{order._id.slice(-8)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.shippingAddress?.text || "Không rõ"}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
                          Chờ gán
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedOrderForAssign(order);
                            setShowAssignModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 font-medium"
                        >
                          Gán Drone
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* All Drones */}
        <div>
          <div className="bg-white rounded-lg shadow-md p-4 mb-4 flex items-center justify-between">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm drone..."
                value={droneSearch}
                onChange={(e) => setDroneSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="ml-4 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium min-w-[150px]"
            >
              <option value="name">Sắp xếp theo tên</option>
              <option value="batteryLevel">Sắp xếp theo pin</option>
              <option value="capacity">Sắp xếp theo tải trọng</option>
              <option value="status">Sắp xếp theo trạng thái</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="ml-2 px-4 py-3 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-all"
            >
              {sortOrder === "asc" ? <SortAsc className="w-5 h-5" /> : <SortDesc className="w-5 h-5" />}
            </button>
          </div>
          <div className="bg-white rounded-lg shadow-md overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã Drone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pin (%)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tải trọng (kg)</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedDrones.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      Không tìm thấy drone
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedDrones.map((drone) => {
                    const badge = getStatusBadge(drone.status);
                    const batteryColor = getBatteryColor(drone.batteryLevel || 0);
                    return (
                      <tr key={drone._id} className="hover:bg-gray-50 transition-all">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{drone.code || drone._id.slice(-8)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{drone.name || `Drone ${drone._id.slice(-4)}`}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${badge.color}`}>
                            {badge.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={batteryColor}>{drone.batteryLevel || 0}%</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {drone.currentLoad || 0}/{drone.capacity || 0}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Drone Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-lg shadow-xl">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">Thêm Drone mới</h2>
              <button onClick={() => setShowAdd(false)}>
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mã drone *</label>
                <input
                  type="text"
                  placeholder="VD: DRN001"
                  value={newDrone.code}
                  onChange={(e) => setNewDrone({ ...newDrone, code: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên hiển thị</label>
                <input
                  type="text"
                  placeholder="VD: Drone Xanh"
                  value={newDrone.name}
                  onChange={(e) => setNewDrone({ ...newDrone, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pin (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="100"
                  value={newDrone.batteryLevel}
                  onChange={(e) => setNewDrone({ ...newDrone, batteryLevel: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tải tối đa (kg)</label>
                <input
                  type="number"
                  min="1"
                  placeholder="5"
                  value={newDrone.capacity}
                  onChange={(e) => setNewDrone({ ...newDrone, capacity: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowAdd(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={createDrone}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all"
              >
                Tạo Drone
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Drone Modal */}
      {showAssignModal && selectedOrderForAssign && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-lg shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">Gán Drone cho Đơn #{selectedOrderForAssign._id.slice(-8)}</h2>
              <button onClick={() => { setShowAssignModal(false); setSelectedOrderForAssign(null); }}>
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            <div className="p-6 max-h-96 overflow-y-auto space-y-4">
              {idleDrones.length === 0 ? (
                <p className="text-center text-gray-500">Không có drone sẵn sàng</p>
              ) : (
                idleDrones.map((drone) => (
                  <div key={drone._id} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-800">{drone.name || `Drone ${drone._id.slice(-4)}`}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Battery className="w-4 h-4" />
                          {drone.batteryLevel || 0}%
                        </span>
                        <span className="flex items-center gap-1">
                          <Package className="w-4 h-4" />
                          {drone.currentLoad || 0}/{drone.capacity || 0}kg
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => assignDrone(drone._id, selectedOrderForAssign._id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-all"
                    >
                      Gán
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}