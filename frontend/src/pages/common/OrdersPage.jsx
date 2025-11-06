import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

export default function OrdersPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [refreshFlag, setRefreshFlag] = useState(0);

  useEffect(() => {
    const wanted = location.state?.status;
    if (wanted) setSelectedStatus(wanted);
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, refreshFlag]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      const res = await fetch(
        `http://localhost:5000/api/order/user/${user.id || user._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Không thể tải đơn hàng");

      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error("Load orders error:", err);
      toast.error(err.message || "Lỗi khi tải đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  // ✅ tính số lượng theo trạng thái để hiển thị badge
  const statusCounts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  const tabs = [
    { key: "all", label: "Tất cả" },
    { key: "pending", label: "Chờ xử lý" },
    { key: "preparing", label: "Đang chuẩn bị" },
    { key: "delivering", label: "Đang giao" },
    { key: "completed", label: "Đã giao" },
    { key: "cancelled", label: "Đã hủy" },
  ];

  const ordersToShow =
    selectedStatus === "all"
      ? orders
      : orders.filter((o) => o.status === selectedStatus);

  // ✅ Hủy đơn hàng
  const cancelOrderById = async (orderId) => {
    if (!orderId) return;
    if (!window.confirm("Bạn có chắc muốn hủy đơn này?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/order/${orderId}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` ,
         },
         body: JSON.stringify({ status: "cancelled" }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Hủy đơn thất bại");
      }

      toast.success("Hủy đơn thành công");
      setRefreshFlag((v) => v + 1); // reload
    } catch (err) {
      console.error("Cancel order error:", err);
      toast.error(err.message || "Lỗi khi hủy đơn");
    }
  };

  // ✅ Khi tab trống
  const EmptyStatusView = ({ statusKey }) => (
    <div className="text-center py-8">
      <p className="mb-4 text-gray-600">
        Không có đơn hàng nào ở trạng thái "
        {tabs.find((t) => t.key === statusKey)?.label || statusKey}"
      </p>
      <button
        onClick={() => navigate("/products")}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Đặt hàng ngay
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
        <p className="mt-3">Đang tải đơn hàng...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Đơn hàng của bạn</h2>

      {/* ✅ Thanh chọn trạng thái */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setSelectedStatus(t.key)}
            className={`px-4 py-2 rounded-full border ${
              selectedStatus === t.key
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700"
            }`}
          >
            {t.label}{" "}
            {t.key !== "all" && (
              <span className="ml-2 text-sm">
                ({statusCounts[t.key] || 0})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ✅ Danh sách đơn hàng */}
      {ordersToShow.length === 0 ? (
        <EmptyStatusView statusKey={selectedStatus} />
      ) : (
        <div className="space-y-4">
          {ordersToShow.map((order) => (
            <div
              key={order._id}
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition cursor-pointer"
              onClick={() => navigate(`/orders/${order._id}`)}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-gray-500">Mã đơn: {order._id}</p>
                  <p className="text-sm text-gray-500">
                    Ngày đặt:{" "}
                    {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      order.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : order.status === "cancelled"
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {order.status === "pending"
                      ? "Chờ xử lý"
                      : order.status === "preparing"
                      ? "Đang chuẩn bị"
                      : order.status === "delivering"
                      ? "Đang giao"
                      : order.status === "completed"
                      ? "Đã giao"
                      : "Đã hủy"}
                  </span>

                  {/* ✅ Nút Hủy chỉ hiển thị khi pending hoặc preparing */}
                  {(order.status === "pending" ||
                    order.status === "preparing") && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        cancelOrderById(order._id);
                      }}
                      className="ml-2 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
                    >
                      Hủy đơn
                    </button>
                  )}
                </div>
              </div>

              {/* ✅ Danh sách món */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Chi tiết món</h3>
                <div className="space-y-2">
                  {order.items.map((it) => (
                    <div
                      key={it.productId._id || it.productId}
                      className="flex justify-between"
                    >
                      <div>{it.productId.name}</div>
                      <div className="text-gray-600">x{it.quantity}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ✅ Tổng tiền */}
              <div className="mt-4 pt-4 border-t flex justify-between items-center">
                <div className="text-gray-600">
                  {order.paymentMethod === "COD"
                    ? "Thanh toán khi nhận hàng"
                    : "Đã thanh toán"}
                </div>
                <div className="text-xl font-bold text-green-600">
                  {order.totalPrice?.toLocaleString("vi-VN")}₫
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
