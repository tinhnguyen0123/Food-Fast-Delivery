// src/components/RestaurantCard.jsx
import React from "react";
import { MapPin } from "lucide-react";

export default function RestaurantCard({ restaurant, onClick }) {
  return (
    <div
      onClick={onClick}
      className="border rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-200 cursor-pointer"
    >
      <img
        src={restaurant.image || "/placeholder.png"}
        alt={restaurant.name}
        className="w-full h-40 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800">{restaurant.name}</h3>
        {restaurant.address && (
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{restaurant.address}</span>
          </div>
        )}
      </div>
    </div>
  );
}
