import { useNavigate } from "react-router-dom";
import { Calendar, DollarSign, XCircle, ChevronRight } from "lucide-react";

/**
 * Component hiển thị thông tin đơn hàng dạng card
 * @param {Object} order - Thông tin đơn hàng
 * @param {Function} onCancel - Callback khi hủy đơn
 */
export default function OrderCard({ order, onCancel }) {
  const navigate = useNavigate();

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      preparing: "bg-blue-100 text-blue-800",
      ready: "bg-purple-100 text-purple-800",
      delivering: "bg-purple-100 text-purple-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusText = (status) => {
    const texts = {
      pending: "Chờ xử lý",
      preparing: "Đang chuẩn bị",
      ready: "Đang chuẩn bị",
      delivering: "Đang giao",
      completed: "Đã giao",
      cancelled: "Đã hủy",
    };
    return texts[status] || status;
  };

  const canCancel = order.status === "pending" || order.status === "preparing";

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="font-semibold text-gray-800">
            Đơn hàng #{order._id.slice(-8)}
          </span>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>
              Ngày đặt: {new Date(order.createdAt).toLocaleDateString("vi-VN")}
            </span>
          </div>
        </div>
        <span
          className={`mt-2 sm:mt-0 px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(
            order.status
          )}`}
        >
          {getStatusText(order.status)}
        </span>
      </div>

      {/* Body - Danh sách sản phẩm */}
      <div
        className="p-4 cursor-pointer"
        onClick={() => navigate(`/orders/${order._id}`)}
      >
        <div className="space-y-3">
          {order.items.slice(0, 2).map((item) => (
            <div
              key={item.productId._id || item.productId}
              className="flex justify-between items-center"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  {item.productId.image ? (
                    <img
                      src={item.productId.image}
                      alt={item.productId.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <span className="text-2xl">🍔</span>
                  )}
                </div>
                <div>
                  <div className="font-medium text-gray-800">
                    {item.productId.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    Số lượng: {item.quantity}
                  </div>
                </div>
              </div>
              <div className="font-semibold text-gray-800">
                {(
                  Number(item.productId.price || 0) * item.quantity
                ).toLocaleString("vi-VN")}
                ₫
              </div>
            </div>
          ))}
          {order.items.length > 2 && (
            <p className="text-sm text-gray-500 text-center">
              ...và {order.items.length - 2} món khác
            </p>
          )}
        </div>
      </div>

      {/* Footer - Tổng tiền và Actions */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-600">
              <DollarSign className="w-5 h-5" />
              <span className="text-sm">
                {order.paymentMethod === "COD"
                  ? "Thanh toán khi nhận"
                  : "Đã thanh toán"}
              </span>
            </div>
            <div className="text-right">
              <span className="text-sm text-gray-500">Tổng tiền: </span>
              <span className="text-xl font-bold text-gray-900">
                {order.totalPrice?.toLocaleString("vi-VN")}₫
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {canCancel && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCancel(order._id);
                }}
                className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors text-sm font-semibold flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Hủy đơn
              </button>
            )}
            <button
              onClick={() => navigate(`/orders/${order._id}`)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold flex items-center gap-2"
            >
              Xem chi tiết
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}