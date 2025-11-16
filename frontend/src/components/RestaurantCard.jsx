import { useNavigate } from "react-router-dom";
import { MapPin, Clock, Star } from "lucide-react";

/**
 * Component hiển thị thông tin nhà hàng dạng card
 * @param {Object} restaurant - Thông tin nhà hàng
 */
export default function RestaurantCard({ restaurant }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/products?restaurantId=${restaurant._id}`)}
      className="group bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        {restaurant.image ? (
          <img
            src={restaurant.image}
            alt={restaurant.name}
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
          {restaurant.name}
        </h3>

        {(restaurant.address || restaurant.location?.text) && (
          <div className="flex items-start gap-2 text-sm text-gray-700 mb-3">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-500" />
            <p className="line-clamp-2">
              {restaurant.address || restaurant.location?.text}
            </p>
          </div>
        )}

        {restaurant.description && (
          <p className="text-sm text-gray-700 mb-4 line-clamp-2">
            {restaurant.description}
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
  );
}