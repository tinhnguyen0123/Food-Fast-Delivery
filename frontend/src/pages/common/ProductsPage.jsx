import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { Search } from "lucide-react";  
import ProductCard from "../../components/ProductCard";

export default function ProductsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const category = params.get("category") || "all";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(""); 

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/product/category/${encodeURIComponent(
          category
        )}`
      );
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
      // 1️⃣ Lấy giỏ gần nhất
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

      // 2️⃣ Thêm item
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

  // ✅ Lọc client-side theo tên sản phẩm
  const filteredProducts = products.filter((p) =>
    p.name?.toLowerCase().includes(query.trim().toLowerCase())
  );

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
      {/* 🔍 Thanh tiêu đề và tìm kiếm */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Danh sách món ({category})
        </h2>

        {/* ✅ Ô tìm kiếm có icon và hiệu ứng focus */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm món theo tên..."
            className="w-full pl-10 pr-4 py-2 border rounded-xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          />
        </div>

        <div className="text-sm text-gray-600">
          Tổng: {filteredProducts.length}
        </div>
      </div>

      {/* 🔽 Hiển thị danh sách sản phẩm */}
      {filteredProducts.length === 0 ? (
        <div className="text-center text-gray-500">
          Không có món nào phù hợp
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredProducts.map((p) => (
            <ProductCard key={p._id} product={p} onAdd={handleAddToCart} />
          ))}
        </div>
      )}
    </div>
  );
}
