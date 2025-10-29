import Order from "../models/order.models.js";

class OrderRepository {
  // Tạo đơn hàng mới
  async createOrder(orderData) {
    const order = new Order(orderData);
    return await order.save();
  }

  // Lấy đơn hàng theo ID
  async getOrderById(orderId) {
    return await Order.findById(orderId)
      .populate("userId", "name email")
      .populate("restaurantId", "name address")
      .populate("items.productId", "name price")
      .populate("paymentId")
      .populate("deliveryId");
  }

  // Lấy tất cả đơn hàng của user
  async getOrdersByUser(userId) {
    return await Order.find({ userId })
      .populate("restaurantId", "name address")
      .populate("items.productId", "name price")
      .sort({ createdAt: -1 });
  }

  // Lấy tất cả đơn hàng của nhà hàng
  async getOrdersByRestaurant(restaurantId) {
    return await Order.find({ restaurantId })
      .populate("userId", "name email")
      .populate("items.productId", "name price")
      .sort({ createdAt: -1 });
  }

  // Lấy đơn hàng theo trạng thái
  async getOrdersByStatus(status) {
    return await Order.find({ status })
      .populate("userId", "name email")
      .populate("restaurantId", "name address")
      .sort({ createdAt: -1 });
  }

  // Cập nhật đơn hàng
  async updateOrder(orderId, updateData) {
    return await Order.findByIdAndUpdate(orderId, updateData, { new: true });
  }

  // Xóa đơn hàng
  async deleteOrder(orderId) {
    return await Order.findByIdAndDelete(orderId);
  }
}

export default new OrderRepository();
