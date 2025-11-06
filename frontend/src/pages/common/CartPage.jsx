import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function CartPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchCart();
  }, []);

  // ✅ Đã thay phần fetchCart cũ bằng bản có xử lý token, 401, 404
  const fetchCart = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const res = await fetch("http://localhost:5000/api/cart/latest", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      if (res.status === 404) {
        // user chưa có giỏ hàng -> hiển thị trống
        setCart(null);
        return;
      }

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Failed to fetch cart");
      }

      const data = await res.json();
      setCart(data);
    } catch (err) {
      console.error("Fetch cart error:", err);
      toast.error(err.message || "Không thể tải giỏ hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    const previousCart = { ...cart };
    setCart((prevCart) => {
      const newItems = prevCart.items.map((item) =>
        item.productId._id === productId
          ? { ...item, quantity: newQuantity }
          : item
      );
      const newTotal = newItems.reduce(
        (sum, item) =>
          sum + Number(item.productId.price) * item.quantity,
        0
      );
      return { ...prevCart, items: newItems, totalPrice: newTotal };
    });

    setUpdating(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cartId: previousCart._id,
          productId,
          quantity: newQuantity,
        }),
      });

      if (!res.ok) throw new Error("Failed to update quantity");

      const updatedCart = await res.json();
      setCart(updatedCart);
    } catch (err) {
      setCart(previousCart);
      console.error("Update quantity error:", err);
      toast.error(err.message || "Lỗi khi cập nhật số lượng");
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveItem = async (productId) => {
    const previousCart = { ...cart };
    const newItems = cart.items.filter(
      (item) => item.productId._id !== productId
    );
    const newTotal = newItems.reduce(
      (sum, item) =>
        sum + Number(item.productId.price) * item.quantity,
      0
    );
    setCart({ ...cart, items: newItems, totalPrice: newTotal });

    setUpdating(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/cart/remove", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cartId: previousCart._id,
          productId,
        }),
      });

      if (!res.ok) throw new Error("Failed to remove item");

      const updatedCart = await res.json();
      setCart(updatedCart);
      toast.success("Đã xóa món khỏi giỏ");
    } catch (err) {
      setCart(previousCart);
      console.error("Remove item error:", err);
      toast.error(err.message || "Lỗi khi xóa món");
    } finally {
      setUpdating(false);
    }
  };

  const handleCheckout = () => {
    if (!cart || !cart.items || cart.items.length === 0) {
      toast.error("Giỏ hàng trống");
      return;
    }
    navigate("/orders/new");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-60">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
          <p className="mt-3 text-gray-600">Đang tải giỏ hàng...</p>
        </div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Giỏ hàng trống</h2>
        <p className="text-gray-600 mb-6">
          Hãy thêm món ăn vào giỏ để đặt hàng
        </p>
        <button
          onClick={() => navigate("/products")}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Xem thực đơn
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Giỏ hàng của bạn</h2>
        <button
          onClick={() => navigate("/products")}
          className="text-blue-600 hover:underline"
        >
          ← Tiếp tục mua hàng
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          {cart.items.map((item) => (
            <div
              key={`${item.productId._id}-${item.quantity}`}
              className="flex items-center gap-4 py-4 border-b last:border-0"
            >
              <div className="w-20 h-20 flex-shrink-0">
                <img
                  src={item.productId.image || "/placeholder.png"}
                  alt={item.productId.name}
                  className="w-full h-full object-cover rounded"
                />
              </div>

              <div className="flex-1">
                <h3 className="font-semibold text-lg">
                  {item.productId.name}
                </h3>
                <p className="text-green-600 font-bold">
                  {Number(item.productId.price)?.toLocaleString("vi-VN")}₫
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={updating}
                  onClick={() =>
                    handleUpdateQuantity(item.productId._id, item.quantity - 1)
                  }
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                >
                  -
                </button>
                <span className="w-8 text-center">{item.quantity}</span>
                <button
                  disabled={updating}
                  onClick={() =>
                    handleUpdateQuantity(item.productId._id, item.quantity + 1)
                  }
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                >
                  +
                </button>
              </div>

              <div className="text-right min-w-[120px]">
                <div className="font-bold text-green-600">
                  {(Number(item.productId.price) * item.quantity).toLocaleString(
                    "vi-VN"
                  )}
                  ₫
                </div>
                <button
                  disabled={updating}
                  onClick={() => handleRemoveItem(item.productId._id)}
                  className="text-red-600 hover:underline text-sm"
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 p-6">
          <div className="flex justify-between mb-4">
            <span className="font-semibold">Tổng tiền:</span>
            <span className="text-xl font-bold text-green-600">
              {Number(cart.totalPrice)?.toLocaleString("vi-VN")}₫
            </span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={updating}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {updating ? "Đang xử lý..." : "Tiến hành đặt hàng"}
          </button>
        </div>
      </div>
    </div>
  );
}
