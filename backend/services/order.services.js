import OrderRepository from "../repositories/order.repositories.js";

class OrderService {
  async createOrder(orderData) {
    if (!orderData.userId || !orderData.restaurantId || !orderData.items) {
      throw new Error("Thiếu thông tin đơn hàng (userId, restaurantId, items)");
    }
    return await OrderRepository.createOrder(orderData);
  }

  async getOrderById(orderId) {
    const order = await OrderRepository.getOrderById(orderId);
    if (!order) throw new Error("Không tìm thấy đơn hàng");
    return order;
  }

  async getOrdersByUser(userId) {
    return await OrderRepository.getOrdersByUser(userId);
  }

  async getOrdersByRestaurant(restaurantId) {
    return await OrderRepository.getOrdersByRestaurant(restaurantId);
  }

  async getOrdersByStatus(status) {
    return await OrderRepository.getOrdersByStatus(status);
  }

  async updateOrder(orderId, updateData) {
    const updated = await OrderRepository.updateOrder(orderId, updateData);
    if (!updated) throw new Error("Cập nhật đơn hàng thất bại");
    return updated;
  }

  async deleteOrder(orderId) {
    const deleted = await OrderRepository.deleteOrder(orderId);
    if (!deleted) throw new Error("Xóa đơn hàng thất bại");
    return deleted;
  }
}

export default new OrderService();
