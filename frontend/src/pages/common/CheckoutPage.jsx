import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const res = await fetch("http://localhost:5000/api/cart/latest", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Không thể lấy giỏ hàng");
      const data = await res.json();
      setCart(data);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Lỗi khi tải giỏ hàng");
      navigate("/cart");
    } finally {
      setLoading(false);
    }
  };

  // ✅ THAY TOÀN BỘ HÀM handleCreateOrder
  const handleCreateOrder = () => {
    // Thay vì gọi API tạo đơn, chuyển sang trang thanh toán
    navigate("/payment");
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
        <p className="mt-3">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Xác nhận đặt hàng</h2>

      <div className="bg-white p-6 rounded shadow mb-6">
        {cart?.items?.map((it) => (
          <div
            key={it.productId._id || it.productId}
            className="flex justify-between py-2 border-b"
          >
            <div>
              <div className="font-semibold">{it.productId.name}</div>
              <div className="text-sm text-gray-500">Số lượng: {it.quantity}</div>
            </div>
            <div className="font-bold text-green-600">
              {(it.productId.price * it.quantity).toLocaleString("vi-VN")}₫
            </div>
          </div>
        ))}

        <div className="flex justify-between mt-4">
          <div className="font-semibold">Tổng tiền</div>
          <div className="font-bold text-xl text-green-600">
            {cart?.totalPrice?.toLocaleString("vi-VN")}₫
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => navigate("/cart")}
          className="flex-1 bg-gray-200 py-3 rounded"
        >
          Quay lại giỏ
        </button>
        <button
          onClick={handleCreateOrder}
          className="flex-1 bg-blue-600 text-white py-3 rounded hover:bg-blue-700"
        >
          Tiếp tục thanh toán
        </button>
      </div>
    </div>
  );
}
