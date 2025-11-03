import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      
      const res = await fetch(`http://localhost:5000/api/order/user/${user.id || user._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

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

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
        <p className="mt-3">Đang tải đơn hàng...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Đơn hàng của bạn</h2>
        <p className="text-gray-600 mb-4">Bạn chưa có đơn hàng nào</p>
        <button
          onClick={() => navigate("/products")}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Đặt hàng ngay
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Đơn hàng của bạn</h2>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order._id}
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition cursor-pointer"
            onClick={() => navigate(`/orders/${order._id}`)}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-gray-500">Mã đơn: {order._id}</p>
                <p className="text-sm text-gray-500">
                  Ngày đặt: {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  order.status === "completed" ? "bg-green-100 text-green-800" :
                  order.status === "cancelled" ? "bg-red-100 text-red-800" :
                  "bg-blue-100 text-blue-800"
                }`}>
                  {order.status === "pending" ? "Chờ xử lý" :
                   order.status === "preparing" ? "Đang chuẩn bị" :
                   order.status === "delivering" ? "Đang giao" :
                   order.status === "completed" ? "Đã giao" :
                   "Đã hủy"}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.productId._id} className="flex justify-between">
                  <span>{item.productId.name} x{item.quantity}</span>
                  <span className="font-medium">
                    {(item.priceAtOrderTime * item.quantity).toLocaleString("vi-VN")}₫
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t flex justify-between items-center">
              <div className="text-gray-600">
                {order.paymentMethod === "COD" ? "Thanh toán khi nhận hàng" : "Đã thanh toán"}
              </div>
              <div className="text-xl font-bold text-green-600">
                {order.totalPrice?.toLocaleString("vi-VN")}₫
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}