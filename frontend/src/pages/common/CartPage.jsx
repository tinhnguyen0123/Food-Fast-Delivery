import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft } from "lucide-react";
// Bỏ import Trash2 vì code gốc không có, tuân thủ "không thêm gì mới"

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function CartPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // ... (TOÀN BỘ LOGIC: loadCart, handleUpdateQuantity, handleRemoveItem, handleClearCart, handleCheckout, groupByRestaurant)
  // ... (KHÔNG THAY ĐỔI BẤT CỨ HÀM NÀO Ở ĐÂY)
  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const res = await fetch(`${API_BASE}/api/cart/latest`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      if (res.status === 404) {
        setCart(null);
        return;
      }

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Không thể tải giỏ hàng");
      }

      const data = await res.json();
      setCart(data);

      // Hiển thị cảnh báo món bị xóa
      if (data._sanitized && Array.isArray(data._removedItems)) {
        data._removedItems.forEach((name) =>
          toast.warning(`Món '${name}' đã bị xóa vì không còn khả dụng`)
        );
      }
    } catch (err) {
      console.error("Fetch cart error:", err);
      toast.error(err.message || "Không thể tải giỏ hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (productId, newQuantity) => {
    // ✅ Cho phép giảm về 0 -> xóa món
    if (newQuantity <= 0) {
      await handleRemoveItem(productId);
      return;
    }

    const previousCart = { ...cart };
    const idOf = (it) =>
      ((it.productId && (it.productId._id || it.productId)) || "").toString();

    // Optimistic update
    setCart((prevCart) => {
      const newItems = (prevCart.items || []).map((item) =>
        idOf(item) === productId.toString() ? { ...item, quantity: newQuantity } : item
      );
      const newTotal = newItems.reduce(
        (sum, item) =>
          sum +
          Number(item.productId.price || item.priceAtOrderTime || 0) * item.quantity,
        0
      );
      return { ...prevCart, items: newItems, totalPrice: newTotal };
    });

    setUpdating(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/cart/add`, {
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

      if (updatedCart._sanitized && Array.isArray(updatedCart._removedItems)) {
        updatedCart._removedItems.forEach((name) =>
          toast.warning(`Món '${name}' đã bị xóa vì nhà hàng không còn khả dụng`)
        );
      }

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
    const idOf = (it) =>
      ((it.productId && (it.productId._id || it.productId)) || "").toString();

    const newItems = (cart.items || []).filter(
      (item) => idOf(item) !== productId.toString()
    );
    const newTotal = newItems.reduce(
      (sum, item) =>
        sum +
        Number(item.productId.price || item.priceAtOrderTime || 0) * item.quantity,
      0
    );
    setCart({ ...cart, items: newItems, totalPrice: newTotal });

    setUpdating(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/cart/remove`, {
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

      await loadCart();
      toast.success("Đã xóa món khỏi giỏ");
    } catch (err) {
      setCart(previousCart);
      console.error("Remove item error:", err);
      toast.error(err.message || "Lỗi khi xóa món");
    } finally {
      setUpdating(false);
    }
  };

  const handleClearCart = async () => {
    if (!cart || !cart._id) return;
    const previousCart = { ...cart };
    setUpdating(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/cart/${cart._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Không thể xóa giỏ hàng");
      }
      setCart(null);
      toast.success("Đã xóa tất cả món trong giỏ");
    } catch (err) {
      setCart(previousCart);
      console.error("Clear cart error:", err);
      toast.error(err.message || "Lỗi khi xóa giỏ hàng");
    } finally {
      setUpdating(false);
    }
  };

  const handleCheckout = () => {
    if (!cart || !cart.items || cart.items.length === 0) {
      toast.error("Giỏ hàng trống");
      return;
    }
    navigate("/payment");
  };

  const groupByRestaurant = () => {
    if (!cart?.items) return [];

    const groups = {};
    cart.items.forEach((item) => {
      const restaurantId =
        item.productId.restaurantId?._id || item.productId.restaurantId;
      const restaurantName =
        item.productId.restaurantId?.name || "Nhà hàng";

      if (!groups[restaurantId]) {
        groups[restaurantId] = {
          restaurantId,
          restaurantName,
          items: [],
          subtotal: 0,
        };
      }

      groups[restaurantId].items.push(item);
      groups[restaurantId].subtotal +=
        Number(item.productId.price) * item.quantity;
    });

    return Object.values(groups);
  };

  // Giao diện LOADING (Cập nhật)
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
          <p className="mt-3 text-gray-600">Đang tải giỏ hàng...</p>
        </div>
      </div>
    );
  }

  // Giao diện GIỎ HÀNG TRỐNG (Cập nhật)
  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="text-center py-20 px-4 bg-gray-100 min-h-screen">
        <div className="max-w-md mx-auto bg-white p-10 rounded-xl shadow-md">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Giỏ hàng của bạn đang trống</h2>
          <p className="text-gray-600 mb-8">
            Hãy thêm sản phẩm vào giỏ để tiếp tục mua sắm.
          </p>
          <button
            onClick={() => navigate("/products")}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-all duration-300 font-semibold text-lg"
          >
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    );
  }

  const restaurantGroups = groupByRestaurant();

  // Giao diện GIỎ HÀNG CÓ HÀNG (Thay đổi lớn)
  return (
    <div className="bg-gray-100 py-8 px-4 min-h-screen">
      {/* Tăng max-width cho layout 2 cột */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-baseline justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Giỏ hàng</h1>
          <button
            onClick={() => navigate("/products")}
            className="flex items-center gap-2 text-blue-600 font-medium hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Tiếp tục mua sắm</span>
          </button>
        </div>

        {/* Layout 2 cột */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-start">

          {/* Cột trái: Danh sách sản phẩm */}
          <div className="lg:col-span-8 space-y-6">
            {restaurantGroups.map((group) => (
              // Mỗi "Nhà hàng" (Người bán) là 1 card
              <div key={group.restaurantId} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-5">
                  <h3 className="font-semibold text-lg text-gray-800 mb-4 pb-4 border-b">
                     {group.restaurantName}
                  </h3>

                  {/* Danh sách sản phẩm trong group */}
                  <div className="divide-y divide-gray-100">
                    {group.items.map((item) => (
                      <div
                        key={`${item.productId._id}-${item.quantity}`}
                        // Tăng khoảng cách và đổi flex-direction
                        className="flex flex-col sm:flex-row gap-4 py-4"
                      >
                        <img
                          src={item.productId.image || "/placeholder.png"}
                          alt={item.productId.name}
                          // Tăng kích thước ảnh
                          className="w-full h-40 sm:w-28 sm:h-28 object-cover rounded-lg flex-shrink-0 border border-gray-100"
                        />

                        <div className="flex-1">
                          <h4 className="font-semibold text-lg text-gray-800">{item.productId.name}</h4>
                          <p className="text-gray-700 font-bold text-base mt-1">
                            {Number(item.productId.price)?.toLocaleString("vi-VN")}₫
                          </p>

                           {/* Nút tăng giảm số lượng (kiểu TMĐT) */}
                          <div className="flex items-center gap-1 mt-3">
                            <button
                              disabled={updating}
                              onClick={() =>
                                handleUpdateQuantity(item.productId._id, item.quantity - 1)
                              }
                              className="w-9 h-9 rounded-md border border-gray-300 flex items-center justify-center text-lg font-medium hover:bg-gray-100 disabled:opacity-50"
                            >
                              -
                            </button>
                            <span className="w-12 h-9 flex items-center justify-center border-t border-b border-gray-300 text-center font-semibold">{item.quantity}</span>
                            <button
                              disabled={updating}
                              onClick={() =>
                                handleUpdateQuantity(item.productId._id, item.quantity + 1)
                              }
                              className="w-9 h-9 rounded-md border border-gray-300 flex items-center justify-center text-lg font-medium hover:bg-gray-100 disabled:opacity-50"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Cột giá tiền và nút xóa */}
                        <div className="text-left sm:text-right">
                           <div className="font-bold text-lg text-gray-900">
                              {(Number(item.productId.price) * item.quantity).toLocaleString("vi-VN")}₫
                           </div>
                           <button
                              disabled={updating}
                              onClick={() => handleRemoveItem(item.productId._id)}
                              className="text-red-600 hover:underline text-sm mt-2 font-medium"
                           >
                              Xóa
                           </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Cột phải: Tóm tắt đơn hàng (Sticky) */}
          <div className="lg:col-span-4 lg:sticky lg:top-8 mt-8 lg:mt-0">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold border-b pb-4 mb-4">Tóm tắt đơn hàng</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-lg">
                  <span className="text-gray-600">Tạm tính:</span>
                  <span className="font-semibold text-gray-800">
                    {Number(cart.totalPrice)?.toLocaleString("vi-VN")}₫
                  </span>
                </div>
                 <div className="flex justify-between text-lg">
                  <span className="text-gray-600">Phí vận chuyển:</span>
                  <span className="font-semibold text-gray-800">
                    Miễn phí
                  </span>
                </div>
                {/* Bạn có thể thêm các dòng khác như Giảm giá, VAT... */}
              </div>

              <div className="flex justify-between text-2xl font-extrabold text-gray-900 pt-4 border-t">
                <span>Tổng cộng:</span>
                <span>
                  {Number(cart.totalPrice)?.toLocaleString("vi-VN")}₫
                </span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={updating}
                // Giữ nguyên màu xanh của user cho CTA chính
                className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-bold text-lg mt-6"
              >
                {updating ? "Đang xử lý..." : "Tiến hành đặt hàng"}
              </button>

              {/* Nút Xóa tất cả được làm mờ đi */}
              <button
                onClick={handleClearCart}
                disabled={!cart || updating}
                className="w-full text-center text-red-600 hover:underline mt-4 font-medium"
              >
                Xóa tất cả
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}