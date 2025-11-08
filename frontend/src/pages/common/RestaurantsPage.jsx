import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/restaurant`);
      if (!res.ok) {
        throw new Error("Không thể tải danh sách nhà hàng");
      }
      const data = await res.json();
      setRestaurants(Array.isArray(data) ? data : data.data || []);
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Lỗi tải nhà hàng");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* 🔹 changed code: thêm nút Quay lại */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              navigate("/")
            }
            className="px-3 py-2 rounded border hover:bg-gray-50"
          >
            ← Quay lại
          </button>
          <h2 className="text-2xl font-bold">Danh sách nhà hàng</h2>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">Đang tải...</div>
      ) : restaurants.length === 0 ? (
        <div className="text-center py-10 text-gray-500">Chưa có nhà hàng</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((r) => (
            <div
              key={r._id}
              className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md"
              onClick={() => navigate(`/products?restaurantId=${r._id}`)}
            >
              <div className="flex items-center gap-4">
                {r.image ? (
                  <img
                    src={r.image}
                    alt={r.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center">
                    🏬
                  </div>
                )}
                <div>
                  <h3 className="font-semibold">{r.name}</h3>
                  <p className="text-sm text-gray-500">
                    {r.address || r.location?.text}
                  </p>
                </div>
              </div>
              <div className="mt-3 text-sm text-gray-600">
                {r.description || ""}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
