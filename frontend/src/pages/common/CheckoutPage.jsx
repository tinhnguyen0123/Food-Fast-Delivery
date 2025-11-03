import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [creating, setCreating] = useState(false);
  const [order, setOrder] = useState(null);
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

  const handleCreateOrder = async () => {
    if (!cart || !cart.items || cart.items.length === 0) {
      toast.error("Giỏ hàng trống");
      return;
    }

    setCreating(true);
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      // Lấy thông tin đầy đủ của từng product để có restaurantId và giá
      const itemsFull = await Promise.all(
        cart.items.map(async (it) => {
          const pid = it.productId._id || it.productId;
          const r = await fetch(`http://localhost:5000/api/product/${pid}`);
          if (!r.ok) throw new Error("Không thể lấy thông tin sản phẩm");
          const p = await r.json();
          return { product: p, quantity: it.quantity };
        })
      );

      // Lấy restaurantId từ item đầu tiên
      const restaurantId = itemsFull[0].product.restaurantId?._id || itemsFull[0].product.restaurantId;

      // Nếu nhiều nhà hàng trong cùng 1 giỏ -> báo lỗi (đơn giản)
      const hasMultiRestaurant = itemsFull.some(
        (it) => (it.product.restaurantId?._id || it.product.restaurantId) !== restaurantId
      );
      if (hasMultiRestaurant) {
        toast.error("Hiện không hỗ trợ đặt nhiều nhà hàng trong cùng 1 đơn. Vui lòng tách giỏ.");
        setCreating(false);
        return;
      }

      const payload = {
        userId: user.id || user._id,
        restaurantId,
        items: itemsFull.map((it) => ({
          productId: it.product._id,
          quantity: it.quantity,
          priceAtOrderTime: it.product.price,
        })),
        totalPrice: cart.totalPrice,
        paymentMethod: "COD",
      };

      const res = await fetch("http://localhost:5000/api/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Tạo đơn thất bại");
      }

      const created = await res.json();
      setOrder(created);
      toast.success("Tạo đơn thành công");
      // Optionally redirect to order detail or orders list
      // navigate(`/orders/${created._id}`);
    } catch (err) {
      console.error("Create order error:", err);
      toast.error(err.message || "Lỗi khi tạo đơn");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
        <p className="mt-3">Đang tải...</p>
      </div>
    );
  }

  if (order) {
    return (
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Đơn hàng đã tạo</h2>
        <div className="bg-white p-6 rounded shadow">
          <p className="mb-2"><strong>Order ID:</strong> {order._id}</p>
          <p className="mb-4"><strong>Trạng thái:</strong> {order.status}</p>
          <div className="mb-4">
            {order.items.map((it) => (
              <div key={it.productId} className="flex justify-between py-2 border-b">
                <div>
                  <div className="font-semibold">{it.productId.name || it.productId}</div>
                  <div className="text-sm text-gray-500">Số lượng: {it.quantity}</div>
                </div>
                <div className="font-bold text-green-600">{(it.priceAtOrderTime || 0).toLocaleString("vi-VN")}₫</div>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center mt-4">
            <div className="text-xl font-bold">Tổng: {(order.totalPrice || 0).toLocaleString("vi-VN")}₫</div>
            <button onClick={() => navigate("/orders")} className="text-blue-600 hover:underline">Xem tất cả đơn hàng</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Xác nhận đặt hàng</h2>

      <div className="bg-white p-6 rounded shadow mb-6">
        {cart?.items?.map((it) => (
          <div key={it.productId._id || it.productId} className="flex justify-between py-2 border-b">
            <div>
              <div className="font-semibold">{it.productId.name}</div>
              <div className="text-sm text-gray-500">Số lượng: {it.quantity}</div>
            </div>
            <div className="font-bold text-green-600">{(it.productId.price * it.quantity).toLocaleString("vi-VN")}₫</div>
          </div>
        ))}

        <div className="flex justify-between mt-4">
          <div className="font-semibold">Tổng tiền</div>
          <div className="font-bold text-xl text-green-600">{cart?.totalPrice?.toLocaleString("vi-VN")}₫</div>
        </div>
      </div>

      <div className="flex gap-4">
        <button onClick={() => navigate("/cart")} className="flex-1 bg-gray-200 py-3 rounded">Quay lại giỏ</button>
        <button onClick={handleCreateOrder} disabled={creating} className="flex-1 bg-blue-600 text-white py-3 rounded hover:bg-blue-700">
          {creating ? "Đang tạo đơn..." : "Xác nhận và đặt hàng"}
        </button>
      </div>
    </div>
  );
}