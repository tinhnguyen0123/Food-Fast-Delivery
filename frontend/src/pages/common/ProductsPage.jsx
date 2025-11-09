import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { Search, UtensilsCrossed, ArrowLeft, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import ProductCard from "../../components/ProductCard";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function ProductsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const restaurantId = params.get("restaurantId") || null;

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  // Phân trang
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);

  // Load danh mục
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/product/categories`);
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch {
        setCategories([]);
      }
    };
    loadCategories();
  }, []);

  // Load sản phẩm theo category hoặc restaurant
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        let url;
        if (restaurantId) {
          url = `${API_BASE}/api/product/restaurant/${encodeURIComponent(restaurantId)}`;
        } else {
          const cat = selectedCategory || "all";
          url = `${API_BASE}/api/product/category/${encodeURIComponent(cat)}`;
        }

        const res = await fetch(url);
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [restaurantId, selectedCategory]);

  // Load thông tin nhà hàng
  useEffect(() => {
    const fetchRestaurantInfo = async () => {
      if (!restaurantId) return;
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
    fetchRestaurantInfo();
  }, [restaurantId]);

  const handleAddToCart = async (product) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.info("Vui lòng đăng nhập để thêm vào giỏ");
      navigate("/login");
      return;
    }

    try {
      let res = await fetch(`${API_BASE}/api/cart/latest`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      let cart;
      if (res.ok) {
        cart = await res.json();
      } else {
        res = await fetch(`${API_BASE}/api/cart`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Không thể tạo giỏ hàng");
        cart = await res.json();
      }

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
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
    const matchesQuery = p.name?.toLowerCase().includes(query.trim().toLowerCase());
    return matchesCategory && matchesQuery;
  });

  // Phân trang
  const total = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  const end = start + limit;
  const pagedProducts = filteredProducts.slice(start, end);

  useEffect(() => {
    setPage(1);
  }, [selectedCategory, query, restaurantId]);

  const getPageNumbers = () => {
    const maxButtons = 5;
    if (totalPages <= maxButtons) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const half = Math.floor(maxButtons / 2);
    let startPage = Math.max(1, page - half);
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);
    if (endPage - startPage + 1 < maxButtons) startPage = Math.max(1, endPage - maxButtons + 1);
    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  };

  const handleBackToRestaurants = () => navigate("/restaurants");

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
        {/* Header nhà hàng */}
        {restaurantId && selectedRestaurant && (
          <div className="mb-8 bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="relative h-48 bg-gradient-to-r from-orange-400 to-red-400">
              {selectedRestaurant.image ? (
                <img src={selectedRestaurant.image} alt={selectedRestaurant.name} className="w-full h-full object-cover" />
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
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{selectedRestaurant.name}</h1>
              {selectedRestaurant.description && <p className="text-gray-600 mb-4">{selectedRestaurant.description}</p>}
              {selectedRestaurant.address && <p className="text-sm text-gray-500">📍 {selectedRestaurant.address}</p>}
            </div>
          </div>
        )}

        {/* Danh mục + Search + Summary */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-4">
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium border ${
                selectedCategory === "all" ? "bg-orange-600 text-white border-orange-600" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              Tất cả
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`px-4 py-2 rounded-full text-sm font-medium border ${
                  selectedCategory === c ? "bg-orange-600 text-white border-orange-600" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1 relative mb-2 md:mb-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm kiếm món ăn..."
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="bg-orange-50 px-4 py-3 rounded-xl">
              <span className="text-sm text-gray-600">
                Tổng: <span className="font-bold text-orange-600">{filteredProducts.length}</span> món
              </span>
            </div>
          </div>
        </div>

        {/* Sản phẩm */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UtensilsCrossed className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Không tìm thấy món ăn</h3>
            <p className="text-gray-600 mb-6">Thử tìm kiếm với từ khóa khác hoặc xem thực đơn khác</p>
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
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {pagedProducts.map((p) => (
                <ProductCard key={p._id} product={p} onAdd={handleAddToCart} />
              ))}
            </div>

            {/* Pagination mới */}
            <div className="mt-10 flex flex-col items-center gap-4">
              <nav className="flex items-center gap-2" aria-label="Pagination">
                <button
                  onClick={() => setPage(1)}
                  disabled={page <= 1}
                  className="h-10 w-10 rounded-xl border bg-white text-gray-700 hover:bg-gray-50 hover:border-orange-500 hover:text-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-sm"
                  title="Trang đầu"
                >
                  <ChevronsLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="h-10 w-10 rounded-xl border bg-white text-gray-700 hover:bg-gray-50 hover:border-orange-500 hover:text-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-sm"
                  title="Trang trước"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {getPageNumbers().map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`h-10 min-w-[40px] px-3 rounded-xl border text-sm font-semibold transition-all ${
                      n === page
                        ? "bg-orange-600 text-white border-orange-600 shadow-md scale-105"
                        : "bg-white text-gray-700 border-gray-300 hover:border-orange-500 hover:text-orange-600 hover:shadow"
                    }`}
                    title={`Trang ${n}`}
                  >
                    {n}
                  </button>
                ))}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="h-10 w-10 rounded-xl border bg-white text-gray-700 hover:bg-gray-50 hover:border-orange-500 hover:text-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-sm"
                  title="Trang sau"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setPage(totalPages)}
                  disabled={page >= totalPages}
                  className="h-10 w-10 rounded-xl border bg-white text-gray-700 hover:bg-gray-50 hover:border-orange-500 hover:text-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-sm"
                  title="Trang cuối"
                >
                  <ChevronsRight className="w-5 h-5" />
                </button>
              </nav>

              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline">Mỗi trang:</span>
                  <select
                    value={limit}
                    onChange={(e) => {
                      setLimit(Number(e.target.value));
                      setPage(1);
                    }}
                    className="px-3 py-2 rounded-xl border bg-white hover:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value={4}>4</option>
                    <option value={8}>8</option>
                    <option value={12}>12</option>
                    <option value={16}>16</option>
                  </select>
                </div>

                <span className="whitespace-nowrap">
                  Hiển thị {Math.min(end, total)} / {total} • Trang {page}/{totalPages}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
