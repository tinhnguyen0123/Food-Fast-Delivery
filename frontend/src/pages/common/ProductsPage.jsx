import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { Search, UtensilsCrossed, ArrowLeft, ShoppingCart } from "lucide-react";
import ProductCard from "../../components/ProductCard";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function ProductsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const category = params.get("category") || "all";
  const restaurantId = params.get("restaurantId") || null;

  const [products, setProducts] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetchProducts();
    if (restaurantId) {
      fetchRestaurantInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, restaurantId]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url;
      if (restaurantId) {
        url = `${API_BASE}/api/product/restaurant/${encodeURIComponent(restaurantId)}`;
      } else {
        url = `${API_BASE}/api/product/category/${encodeURIComponent(category)}`;
      }

      const res = await fetch(url);
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Failed to load products" }));
        throw new Error(err.message || "Failed to load products");
      }

      const data = await res.json();
      setProducts(Array.isArray(data) ? data : data.items || data);
    } catch (err) {
      console.error("Fetch products error:", err);
      toast.error(err.message || "Không thể tải sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const fetchRestaurantInfo = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/restaurant/${restaurantId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedRestaurant(data);
      }
    } catch (err) {
      console.error("Fetch restaurant error:", err);
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
      let res = await fetch(`${API_BASE}/api/cart/latest`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      let cart;
      if (res.ok) {
        cart = await res.json();
      } else {
        // nếu không có, tạo mới
        res = await fetch(`${API_BASE}/api/cart`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Không thể tạo giỏ hàng");
        cart = await res.json();
      }

      // 2️⃣ Thêm item
      const addRes = await fetch(`${API_BASE}/api/cart/add`, {
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

  // Lọc sản phẩm
  const filteredProducts = products.filter((p) =>
    p.name?.toLowerCase().includes(query.trim().toLowerCase())
  );

  const handleBackToRestaurants = () => {
    navigate("/restaurants");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-orange-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Đang tải món ngon...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header với thông tin nhà hàng */}
        {restaurantId && selectedRestaurant && (
          <div className="mb-8 bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="relative h-48 bg-gradient-to-r from-orange-400 to-red-400">
              {selectedRestaurant.image ? (
                <img
                  src={selectedRestaurant.image}
                  alt={selectedRestaurant.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <UtensilsCrossed className="w-20 h-20 text-white/50" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <button
                onClick={handleBackToRestaurants}
                className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white transition-all flex items-center gap-2 shadow-lg"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="font-medium">Danh sách nhà hàng</span>
              </button>
            </div>
            <div className="p-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {selectedRestaurant.name}
              </h1>
              {selectedRestaurant.description && (
                <p className="text-gray-600 mb-4">{selectedRestaurant.description}</p>
              )}
              {selectedRestaurant.address && (
                <p className="text-sm text-gray-500">📍 {selectedRestaurant.address}</p>
              )}
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Tìm kiếm món ăn..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-orange-50 px-4 py-3 rounded-xl">
                  <span className="text-sm text-gray-600">
                    Tổng: <span className="font-bold text-orange-600">{filteredProducts.length}</span> món
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Danh sách sản phẩm */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UtensilsCrossed className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Không tìm thấy món ăn
            </h3>
            <p className="text-gray-600 mb-6">
              Thử tìm kiếm với từ khóa khác hoặc xem thực đơn khác
            </p>
            {query && (
              <button
                onClick={() => setQuery("")}
                className="px-6 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((p) => (
              <ProductCard key={p._id} product={p} onAdd={handleAddToCart} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}