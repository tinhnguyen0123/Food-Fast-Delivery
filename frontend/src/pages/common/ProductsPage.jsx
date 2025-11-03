import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import ProductCard from "../../components/ProductCard";

export default function ProductsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const category = params.get("category") || "food";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/product/category/${encodeURIComponent(category)}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to load products");
      }
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Fetch products error:", err);
      toast.error(err.message || "Không thể tải sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.info("Vui lòng đăng nhập để thêm vào giỏ");
      navigate("/login");
      return;
    }

    try {
      // 1) Lấy giỏ gần nhất
      let res = await fetch("http://localhost:5000/api/cart/latest", {
        headers: { Authorization: `Bearer ${token}` },
      });

      let cart;
      if (res.ok) {
        cart = await res.json();
      } else {
        // nếu không có, tạo mới
        res = await fetch("http://localhost:5000/api/cart", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Không thể tạo giỏ hàng");
        cart = await res.json();
      }

      // 2) Thêm item
      const addRes = await fetch("http://localhost:5000/api/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cartId: cart._id,
          productId: product._id,
          quantity: 1,
        }),
      });

      if (!addRes.ok) {
        const err = await addRes.json();
        throw new Error(err.message || "Thêm vào giỏ thất bại");
      }

      toast.success("Đã thêm vào giỏ");
    } catch (err) {
      console.error("Add to cart error:", err);
      toast.error(err.message || "Lỗi khi thêm vào giỏ");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-60">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
          <p className="mt-3 text-gray-600">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Danh sách món ({category})</h2>
        <div className="text-sm text-gray-600">Tổng: {products.length}</div>
      </div>

      {products.length === 0 ? (
        <div className="text-center text-gray-500">Chưa có món nào</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} onAdd={handleAddToCart} />
          ))}
        </div>
      )}
    </div>
  );
}