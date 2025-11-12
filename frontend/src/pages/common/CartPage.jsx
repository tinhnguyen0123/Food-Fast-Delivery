import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft } from "lucide-react";

export default function CartPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

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
    if (newQuantity < 1) return;

    const previousCart = { ...cart };
    setCart((prevCart) => {
      const newItems = prevCart.items.map((item) =>
        item.productId._id === productId
          ? { ...item, quantity: newQuantity }
          : item
      );
      const newTotal = newItems.reduce(
        (sum, item) => sum + Number(item.productId.price) * item.quantity,
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
      toast.success("Cập nhật số lượng thành công");

      if (updatedCart._sanitized && Array.isArray(updatedCart._removedItems)) {
        updatedCart._removedItems.forEach((name) =>
          toast.warning(
            `Món '${name}' đã bị xóa vì nhà hàng không còn khả dụng`
          )
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
        Number(item.productId.price || item.priceAtOrderTime || 0) *
          item.quantity,
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

  // Thêm hàm xóa tất cả món
  const handleClearCart = async () => {
    if (!cart || !cart._id) return;
    const previousCart = { ...cart };
    setUpdating(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/cart/${cart._id}`, {
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
          Chọn món ăn
        </button>
      </div>
    );
  }

  const restaurantGroups = groupByRestaurant();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Giỏ hàng của bạn</h2>
        <button
          onClick={() => navigate("/products")}
          className="flex items-center gap-2 bg-white border border-blue-500 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 shadow-sm transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-medium">Tiếp tục mua hàng</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 space-y-6">
          {restaurantGroups.map((group) => (
            <div key={group.restaurantId} className="border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-lg">🏪</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{group.restaurantName}</h3>
                  <p className="text-sm text-gray-500">
                    {group.items.length} món •{" "}
                    {group.subtotal.toLocaleString("vi-VN")}₫
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {group.items.map((item) => (
                  <div
                    key={`${item.productId._id}-${item.quantity}`}
                    className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition"
                  >
                    <div className="w-20 h-20 flex-shrink-0">
                      <img
                        src={item.productId.image || "/placeholder.png"}
                        alt={item.productId.name}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.productId.name}</h4>
                      <p className="text-green-600 font-bold text-sm">
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
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
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
                        {(Number(item.productId.price) * item.quantity).toLocaleString("vi-VN")}₫
                      </div>
                      <button
                        disabled={updating}
                        onClick={() => handleRemoveItem(item.productId._id)}
                        className="text-red-600 hover:underline text-sm mt-1"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 p-6 border-t flex flex-col gap-4">
          <div className="flex justify-between text-lg">
            <span className="font-semibold">Tổng tiền:</span>
            <span className="text-2xl font-bold text-green-600">
              {Number(cart.totalPrice)?.toLocaleString("vi-VN")}₫
            </span>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleCheckout}
              disabled={updating}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-semibold"
            >
              {updating ? "Đang xử lý..." : "Tiến hành đặt hàng"}
            </button>

            <button
              onClick={handleClearCart}
              disabled={!cart || updating}
              className="bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 disabled:opacity-50 font-semibold"
            >
              Xóa tất cả
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
