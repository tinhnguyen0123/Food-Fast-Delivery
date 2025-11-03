import React from "react";

// ...existing code...
export default function ProductCard({ product, onAdd }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col">
      <div className="h-40 w-full mb-3 overflow-hidden rounded">
        <img
          src={product.image || product.imageUrl || "/placeholder.png"}
          alt={product.name}
          className="object-cover w-full h-full"
        />
      </div>

      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
        {product.description && (
          <p className="text-sm text-gray-600 mt-1">{product.description}</p>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xl font-bold text-green-600">
          {typeof product.price === "number" ? product.price.toLocaleString("vi-VN") + "₫" : "-"}
        </span>
        <button
          onClick={() => onAdd && onAdd(product)}
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
        >
          Thêm
        </button>
      </div>
    </div>
  );
}