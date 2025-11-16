import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { MapPin, Clock, Star, ArrowLeft, Search } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // ... (TOÀN BỘ LOGIC: load, filteredRestaurants)
  // ... (KHÔNG THAY ĐỔI BẤT CỨ HÀM NÀO Ở ĐÂY)
  // ✅ Chỉ lấy danh sách nhà hàng public (đã verified, chưa bị khóa)
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

  // 🔍 Lọc nhà hàng theo từ khóa tìm kiếm
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
        {/* Header - Chỉ giữ nút Back */}
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

        {/* Bọc layout 2 cột */}
        <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-8 items-start">

          {/* Cột 1: Sidebar Bộ lọc (chứa Search) */}
          <div className="lg:col-span-1 lg:sticky lg:top-8 bg-white rounded-xl shadow-md p-4 mb-6 lg:mb-0">
            <h3 className="text-xl font-bold text-gray-800 mb-4 px-2">
              Tìm kiếm
            </h3>
            {/* Search Bar (Đã di chuyển vào đây) */}
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
            {/* (Có thể thêm các bộ lọc khác ở đây trong tương lai) */}
          </div>

          {/* Cột 2: Nội dung chính (Title, Grid) */}
          <div className="lg:col-span-3 space-y-6">

            {/* Tiêu đề và số lượng */}
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
              // Điều chỉnh grid-cols cho phù hợp với cột nội dung 3/4
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredRestaurants.map((r) => (
                  <div
                    key={r._id}
                    onClick={() => navigate(`/products?restaurantId=${r._id}`)}
                    className="group bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300"
                  >
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden bg-gray-100">
                      {r.image ? (
                        <img
                          src={r.image}
                          alt={r.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-6xl">🏬</span>
                        </div>
                      )}
                      <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-semibold">4.5</span>
                      </div>
                    </div>
                    {/* Content */}
                    <div className="p-5">
                      <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-orange-600 transition-colors">
                        {r.name}
                      </h3>
                      {(r.address || r.location?.text) && (
                        <div className="flex items-start gap-2 text-sm text-gray-700 mb-3">
                          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-500" />
                          <p className="line-clamp-2">
                            {r.address || r.location?.text}
                          </p>
                        </div>
                      )}
                      {r.description && (
                        <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                          {r.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>30-45 phút</span>
                        </div>
                        <button className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-semibold hover:bg-orange-700 transition-all duration-200">
                          Xem menu
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}