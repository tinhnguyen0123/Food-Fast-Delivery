import { useEffect, useState } from "react";
import { toast } from "react-toastify";

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

      // ✅ Lấy đơn hàng thuộc nhà hàng này và lọc status = preparing
      let preparing = [];
      const orderRes = await fetch(`${API_BASE}/api/order/restaurant/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.message || "Tải đơn chờ gán thất bại");
      const orders = Array.isArray(orderData) ? orderData : orderData.orders || [];
      preparing = orders.filter((o) => o.status === "preparing");

      setPendingOrders(preparing);
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

      toast.success("Đã gán drone cho đơn hàng!");
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
      toast.success(`Đã gán ${data.assigned} đơn cho drone`);
      await loadData();
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Lỗi phân bổ tự động");
    }
  };

  // ✅ Tạo drone mới (có kèm restaurantId)
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
        restaurantId: rid || (await ensureRestaurantId()), // ✅ gửi kèm restaurantId
      };

      const res = await fetch(`${API_BASE}/api/drone`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Tạo drone thất bại");

      toast.success("Đã tạo drone");
      setShowAdd(false);
      setNewDrone({ code: "", name: "", batteryLevel: 100, capacity: 5 });
      await loadData();
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Lỗi tạo drone");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-semibold">Quản lý Drone</h1>
          <p className="text-gray-500 text-sm">Theo dõi trạng thái và gán đơn cho drone</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAdd((p) => !p)} className="border px-4 py-2 rounded hover:bg-gray-50">
            {showAdd ? "Đóng" : "Thêm Drone"}
          </button>
          <button onClick={autoAssign} className="border px-4 py-2 rounded hover:bg-gray-50">
            Tự động phân bổ
          </button>
          <button onClick={loadData} className="border px-4 py-2 rounded hover:bg-gray-50">
            Tải lại
          </button>
        </div>
      </div>

      {/* Form tạo drone mới */}
      {showAdd && (
        <div className="mb-6 border rounded p-4 bg-white">
          <h3 className="font-semibold mb-3">Tạo Drone mới</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              className="border rounded px-3 py-2"
              placeholder="Mã drone (code)"
              value={newDrone.code}
              onChange={(e) => setNewDrone((p) => ({ ...p, code: e.target.value }))}
            />
            <input
              className="border rounded px-3 py-2"
              placeholder="Tên hiển thị"
              value={newDrone.name}
              onChange={(e) => setNewDrone((p) => ({ ...p, name: e.target.value }))}
            />
            <input
              type="number"
              className="border rounded px-3 py-2"
              placeholder="Pin (%)"
              value={newDrone.batteryLevel}
              onChange={(e) => setNewDrone((p) => ({ ...p, batteryLevel: Number(e.target.value) }))}
            />
            <input
              type="number"
              className="border rounded px-3 py-2"
              placeholder="Tải tối đa (kg)"
              value={newDrone.capacity}
              onChange={(e) => setNewDrone((p) => ({ ...p, capacity: Number(e.target.value) }))}
            />
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 border rounded hover:bg-gray-50">
              Hủy
            </button>
            <button onClick={createDrone} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Lưu
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-gray-500">Đang tải...</div>
      ) : (
        <>
          {/* Tổng quan */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="border rounded p-4 text-center">
              <p className="text-gray-500 text-sm">Tổng drone</p>
              <p className="text-2xl font-bold">{drones.length}</p>
            </div>
            <div className="border rounded p-4 text-center">
              <p className="text-gray-500 text-sm">Sẵn sàng</p>
              <p className="text-2xl font-bold text-green-600">{idleDrones.length}</p>
            </div>
            <div className="border rounded p-4 text-center">
              <p className="text-gray-500 text-sm">Đang hoạt động</p>
              <p className="text-2xl font-bold text-blue-600">{activeDrones.length}</p>
            </div>
            <div className="border rounded p-4 text-center">
              <p className="text-gray-500 text-sm">Đơn chờ gán</p>
              <p className="text-2xl font-bold text-amber-600">{pendingOrders.length}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Danh sách đơn cần gán */}
            <div className="border rounded p-4">
              <h3 className="font-semibold mb-3">Đơn cần gán drone</h3>
              {pendingOrders.length === 0 ? (
                <p className="text-sm text-gray-500">Không có đơn chờ</p>
              ) : (
                <div className="space-y-3">
                  {pendingOrders.map((o) => (
                    <div key={o._id} className="border rounded p-3">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium">Đơn #{o._id.slice(-6)}</p>
                          <p className="text-xs text-gray-500 mt-1">{o.shippingAddress?.text}</p>
                        </div>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">{o.status}</span>
                      </div>
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-1">Drone khả dụng:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {idleDrones.length === 0 ? (
                            <p className="text-xs text-gray-500">Không có drone sẵn sàng</p>
                          ) : (
                            idleDrones.map((d) => (
                              <button
                                key={d._id}
                                onClick={() => assignDrone(d._id, o._id)}
                                className="w-full border rounded px-3 py-2 text-left hover:bg-gray-50"
                              >
                                <span className="font-medium">{d.name || `Drone ${d._id.slice(-4)}`}</span>
                                <span className="text-xs text-gray-500 block">
                                  Pin: {d.batteryLevel || 0}% — Tải: {d.currentLoad || 0}/{d.capacity || 0}
                                </span>
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Danh sách tất cả drone */}
            <div className="border rounded p-4">
              <h3 className="font-semibold mb-3">Tất cả drone</h3>
              {drones.length === 0 ? (
                <p className="text-sm text-gray-500">Chưa có drone</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-2">Tên</th>
                        <th className="text-left py-2 px-2">Trạng thái</th>
                        <th className="text-center py-2 px-2">Pin</th>
                        <th className="text-center py-2 px-2">Tải</th>
                      </tr>
                    </thead>
                    <tbody>
                      {drones.map((d) => (
                        <tr key={d._id} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-2">{d.name || `Drone ${d._id.slice(-4)}`}</td>
                          <td className="py-2 px-2 text-xs">
                            <span className="px-2 py-1 rounded bg-gray-100">{d.status}</span>
                          </td>
                          <td className="py-2 px-2 text-center">{d.batteryLevel || 0}%</td>
                          <td className="py-2 px-2 text-center">
                            {d.currentLoad || 0}/{d.capacity || 0}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
