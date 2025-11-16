import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft, Search } from "lucide-react";
import RestaurantCard from "../../components/RestaurantCard";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // ...existing code...

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/restaurant/public`);
        if (!res.ok) throw new Error("Không thể tải danh sách nhà hàng");
        const data = await res.json();
        setRestaurants(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        toast.error(e.message || "Lỗi tải nhà hàng");
        setRestaurants([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredRestaurants = restaurants.filter((r) => {
    const query = searchQuery.toLowerCase().trim();
    return (
      !query ||
      r.name?.toLowerCase().includes(query) ||
      r.address?.toLowerCase().includes(query) ||
      r.description?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 text-gray-700 hover:text-orange-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Quay lại trang chủ</span>
          </button>
        </div>

        {/* Layout 2 cột */}
        <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-8 items-start">
          {/* Sidebar */}
          <div className="lg:col-span-1 lg:sticky lg:top-8 bg-white rounded-xl shadow-md p-4 mb-6 lg:mb-0">
            <h3 className="text-xl font-bold text-gray-800 mb-4 px-2">
              Tìm kiếm
            </h3>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm nhà hàng..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Title */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Khám phá nhà hàng
                </h1>
                <p className="text-lg text-gray-700">
                  {filteredRestaurants.length} nhà hàng đang phục vụ
                </p>
              </div>
            </div>

            {/* Content */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-md">
                <div className="animate-spin h-12 w-12 border-4 border-orange-600 border-t-transparent rounded-full mb-4" />
                <p className="text-gray-600 font-medium">Đang tải danh sách nhà hàng...</p>
              </div>
            ) : filteredRestaurants.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl shadow-md">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">🏬</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {searchQuery ? "Không tìm thấy nhà hàng" : "Chưa có nhà hàng"}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery
                    ? "Thử tìm kiếm với từ khóa khác"
                    : "Hãy quay lại sau nhé!"}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="px-6 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors"
                  >
                    Xem tất cả
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredRestaurants.map((restaurant) => (
                  <RestaurantCard key={restaurant._id} restaurant={restaurant} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}