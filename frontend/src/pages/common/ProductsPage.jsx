import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { Search, UtensilsCrossed } from "lucide-react";
import ProductCard from "../../components/ProductCard";
import RestaurantCard from "../../components/RestaurantCard"; // Giả sử bạn có component này

export default function ProductsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const restaurantId = params.get("restaurantId");

  const [products, setProducts] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (restaurantId) {
      fetchProductsByRestaurant(restaurantId);
    } else {
      fetchRestaurants();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  const fetchRestaurants = async () => {
    setLoading(true);
    setProducts([]);
    setSelectedRestaurant(null);
    try {
      const res = await fetch(`http://localhost:5000/api/restaurant`);
      if (!res.ok) {
        throw new Error("Không thể tải danh sách nhà hàng");
      }
      const data = await res.json();
      setRestaurants(data);
    } catch (err) {
      console.error("Fetch restaurants error:", err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsByRestaurant = async (rid) => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/product/restaurant/${rid}`
      );
      // Cũng lấy thông tin nhà hàng để hiển thị tên
      const restaurantRes = await fetch(
        `http://localhost:5000/api/restaurant/${rid}`
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to load products");
      }
      const data = await res.json();
      setProducts(data);

      if (restaurantRes.ok) {
        setSelectedRestaurant(await restaurantRes.json());
      }
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

  // Lọc sản phẩm hoặc nhà hàng
  const filteredProducts = products.filter((p) =>
    p.name?.toLowerCase().includes(query.trim().toLowerCase())
  );
  const filteredRestaurants = restaurants.filter((r) =>
    r.name?.toLowerCase().includes(query.trim().toLowerCase())
  );

  const handleSelectRestaurant = (id) => {
    navigate(`/products?restaurantId=${id}`);
  };
  const handleBackToRestaurants = () => {
    navigate("/products");
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
      {/* Thanh tiêu đề và tìm kiếm */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          {restaurantId && (
            <button
              onClick={handleBackToRestaurants}
              className="text-blue-600 hover:underline"
            >
              &larr; Quay lại
            </button>
          )}
          <h2 className="text-2xl font-bold text-gray-800">
            {restaurantId
              ? `Thực đơn ${selectedRestaurant?.name || ""}`
              : "Chọn nhà hàng"}
          </h2>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={restaurantId ? "Tìm món..." : "Tìm nhà hàng..."}
            className="w-full pl-10 pr-4 py-2 border rounded-xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          />
        </div>

        <div className="text-sm text-gray-600">
          Tổng: {restaurantId ? filteredProducts.length : filteredRestaurants.length}
        </div>
      </div>

      {/* Hiển thị danh sách nhà hàng hoặc sản phẩm */}
      {restaurantId ? (
        // Chế độ xem sản phẩm
        filteredProducts.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            Không có món nào phù hợp
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredProducts.map((p) => (
              <ProductCard key={p._id} product={p} onAdd={handleAddToCart} />
            ))}
          </div>
        )
      ) : (
        // Chế độ xem nhà hàng
        filteredRestaurants.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            Không có nhà hàng nào phù hợp
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredRestaurants.map((r) => (
              <RestaurantCard key={r._id} restaurant={r} onClick={() => handleSelectRestaurant(r._id)} />
            ))}
          </div>
        )
      )}
    </div>
  );
}
