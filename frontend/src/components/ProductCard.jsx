import React from "react";
import { ShoppingCart, Ban } from "lucide-react";

export default function ProductCard({ product, onAdd }) {
  const isAvailable = product.available !== false;

  return (
    <div
      className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 ${
        isAvailable
          ? "hover:shadow-2xl transform hover:-translate-y-1"
          : "opacity-50 grayscale"
      }`}
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-200">
        <img
          src={product.image || "/placeholder.png"}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <span className="text-white font-bold text-lg bg-black/50 px-4 py-2 rounded-lg">
              Ngưng bán
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col h-[180px]">
        <div className="flex-grow">
          <h3 className="font-bold text-lg text-gray-800 line-clamp-2">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {product.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between mt-4">
          <span className="text-xl font-bold text-orange-600">
            {Number(product.price || 0).toLocaleString("vi-VN")}₫
          </span>

          {isAvailable ? (
            <button
              onClick={() => onAdd(product)}
              className="bg-orange-100 text-orange-600 px-3 py-2 rounded-lg hover:bg-orange-200 transition-colors flex items-center gap-2"
              title="Thêm vào giỏ"
            >
              <ShoppingCart className="w-5 h-5" />
              Thêm vào giỏ
            </button>
          ) : (
            <div
              className="bg-gray-200 text-gray-500 px-3 py-2 rounded-lg flex items-center gap-2 cursor-not-allowed"
              title="Món ăn đã ngưng bán"
            >
              <Ban className="w-5 h-5" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}