import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

const TABS = [
  { key: "all", label: "Tất cả" },
  { key: "pending", label: "Chờ xử lý" },
  { key: "preparing", label: "Đang chuẩn bị" },
  { key: "delivering", label: "Đang giao" },
  { key: "completed", label: "Đã giao" },
  { key: "cancelled", label: "Đã hủy" },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [restaurantId, setRestaurantId] = useState(localStorage.getItem("myRestaurantId") || "");
  const token = localStorage.getItem("token");

  
  const ensureRestaurantId = async () => {
    if (restaurantId) return restaurantId;
    const cached = localStorage.getItem("myRestaurantId");
    if (cached) {
      setRestaurantId(cached);
      return cached;
    }
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user?.id && !user?._id) throw new Error("Chưa đăng nhập");
      const res = await fetch(`http://localhost:5000/api/restaurant/owner/${user.id || user._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const list = await res.json();
      if (!res.ok) throw new Error(list.message || "Không lấy được nhà hàng của bạn");
      if (!Array.isArray(list) || list.length === 0) {
        toast.info("Tài khoản chưa có nhà hàng (chưa đăng ký hoặc chưa được duyệt).");
        return "";
      }
      const rid = list[0]._id;
      setRestaurantId(rid);
      localStorage.setItem("myRestaurantId", rid);
      return rid;
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Lỗi lấy thông tin nhà hàng");
      return "";
    }
  };

  // ✅ Tải danh sách đơn hàng theo nhà hàng
  const loadOrders = async () => {
    setLoading(true);
    try {
      const rid = await ensureRestaurantId();
      if (!rid) {
        setOrders([]);
        return;
      }
      const res = await fetch(`http://localhost:5000/api/order/restaurant/${rid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Tải đơn hàng thất bại");
      setOrders(Array.isArray(data) ? data : data.orders || []);
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Lỗi tải đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // ✅ Đếm số đơn theo trạng thái
  const statusCounts = useMemo(
    () =>
      orders.reduce(
        (acc, o) => {
          acc[o.status] = (acc[o.status] || 0) + 1;
          acc.all++;
          return acc;
        },
        { all: 0 }
      ),
    [orders]
  );

  const ordersToShow = tab === "all" ? orders : orders.filter((o) => o.status === tab);

  // ✅ Cập nhật trạng thái đơn hàng
  const updateStatus = async (orderId, status) => {
    try {
      const res = await fetch(`http://localhost:5000/api/order/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Cập nhật trạng thái thất bại");
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status } : o)));
      toast.success("Đã cập nhật trạng thái đơn hàng");
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Lỗi cập nhật trạng thái");
    }
  };

  // ✅ Giao diện
  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-semibold">Quản lý đơn hàng</h1>
          <p className="text-gray-500 text-sm">Theo dõi và cập nhật trạng thái đơn</p>
        </div>
        <button onClick={loadOrders} className="border px-4 py-2 rounded hover:bg-gray-50">
          Tải lại
        </button>
      </div>

      {/* Tabs trạng thái */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-2 rounded-full text-sm whitespace-nowrap ${
              tab === t.key ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {t.label} ({statusCounts[t.key] || 0})
          </button>
        ))}
      </div>

      {/* Danh sách đơn */}
      {loading ? (
        <div className="text-center py-10 text-gray-500">Đang tải...</div>
      ) : ordersToShow.length === 0 ? (
        <div className="text-center py-10 text-gray-500">Không có đơn phù hợp</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          {ordersToShow.map((o) => (
            <div key={o._id} className="border rounded p-4 hover:shadow">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">Đơn #{o._id.slice(-6)}</h3>
                    <span className="text-xs px-2 py-1 rounded bg-gray-100">{o.status}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Tổng: {Intl.NumberFormat("vi-VN").format(o.totalPrice || 0)} đ
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Tạo lúc</p>
                  <p className="text-sm font-medium">{new Date(o.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div className="mt-3 border-t pt-3">
                <p className="text-sm font-medium">Món</p>
                <ul className="text-sm text-gray-700 list-disc ml-5 mt-1 space-y-0.5">
                  {(o.items || []).map((it, idx) => (
                    <li key={idx}>
                      {it.productId?.name || it.name || "Món"} x {it.quantity} —{" "}
                      {Intl.NumberFormat("vi-VN").format(
                        (it.priceAtOrderTime || it.price || 0) * (it.quantity || 1)
                      )}{" "}
                      đ
                    </li>
                  ))}
                </ul>
              </div>

              {o.shippingAddress?.text && (
                <div className="mt-3 text-sm text-gray-700">
                  <span className="font-medium">Giao đến: </span>
                  {o.shippingAddress.text}
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                {["pending", "preparing", "delivering", "completed", "cancelled"].map((s) => (
                  <button
                    key={s}
                    onClick={() => updateStatus(o._id, s)}
                    className={`px-3 py-1 rounded border text-sm ${
                      o.status === s ? "bg-blue-600 text-white" : "hover:bg-gray-50"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
