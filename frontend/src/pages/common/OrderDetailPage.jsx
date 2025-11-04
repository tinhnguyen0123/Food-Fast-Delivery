import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/order/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Không thể tải thông tin đơn hàng");
      const data = await res.json();
      setOrder(data);
    } catch (err) {
      console.error("Load order error:", err);
      toast.error(err.message || "Lỗi khi tải đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
        <p className="mt-3">Đang tải thông tin đơn hàng...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Không tìm thấy đơn hàng</h2>
        <button
          onClick={() => navigate("/orders")}
          className="text-blue-600 hover:underline"
        >
          ← Quay lại danh sách đơn hàng
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Chi tiết đơn hàng</h2>
        <button
          onClick={() => navigate("/orders")}
          className="text-blue-600 hover:underline"
        >
          ← Quay lại danh sách
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between mb-6">
            <div>
              <p className="text-sm text-gray-600">Mã đơn hàng</p>
              <p className="font-medium">{order._id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Ngày đặt</p>
              <p className="font-medium">
                {new Date(order.createdAt).toLocaleDateString("vi-VN")}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Trạng thái</p>
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
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4">Chi tiết món</h3>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.productId._id}
                  className="flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">{item.productId.name}</p>
                    <p className="text-sm text-gray-600">
                      Số lượng: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {(item.priceAtOrderTime * item.quantity).toLocaleString(
                        "vi-VN"
                      )}
                      ₫
                    </p>
                    <p className="text-sm text-gray-600">
                      ({item.priceAtOrderTime?.toLocaleString("vi-VN")}₫/món)
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ✅ Thêm phần hiển thị địa chỉ giao hàng */}
          {order.shippingAddress && (
            <div className="border-t mt-6 pt-6">
              <h3 className="font-semibold mb-4">Địa chỉ giao hàng</h3>
              <p className="text-gray-700">{order.shippingAddress.text}</p>
              {order.shippingAddress.location && (
                <p className="text-sm text-gray-500 mt-2">
                  📍 Tọa độ:{" "}
                  {order.shippingAddress.location.lat.toFixed(4)},{" "}
                  {order.shippingAddress.location.lng.toFixed(4)}
                </p>
              )}
            </div>
          )}

          {order.restaurantId && (
            <div className="border-t mt-6 pt-6">
              <h3 className="font-semibold mb-4">Thông tin nhà hàng</h3>
              <p className="font-medium">{order.restaurantId.name}</p>
              <p className="text-gray-600">{order.restaurantId.address}</p>
            </div>
          )}

          <div className="border-t mt-6 pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-600">Phương thức thanh toán</p>
                <p className="font-medium">
                  {order.paymentMethod === "COD"
                    ? "Thanh toán khi nhận hàng"
                    : "Đã thanh toán"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-gray-600">Tổng tiền</p>
                <p className="text-2xl font-bold text-green-600">
                  {order.totalPrice?.toLocaleString("vi-VN")}₫
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
