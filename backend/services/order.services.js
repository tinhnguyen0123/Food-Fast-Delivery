import OrderRepository from "../repositories/order.repositories.js";
import ProductRepository from "../repositories/product.repositories.js";

class OrderService {
  async createOrder(orderData) {
    if (
      (!orderData.restaurantId || orderData.restaurantId === null) &&
      Array.isArray(orderData.items) &&
      orderData.items.length > 0
    ) {
      const firstProductId = orderData.items[0]?.productId;
      if (firstProductId) {
        const product = await ProductRepository.getProductById(firstProductId);
        orderData.restaurantId =
          product?.restaurantId?._id || product?.restaurantId || orderData.restaurantId;
      }
    }

    // Validate tối thiểu
    if (
      !orderData.userId ||
      !orderData.restaurantId ||
      !Array.isArray(orderData.items) ||
      orderData.items.length === 0
    ) {
      throw new Error("Thiếu thông tin đơn hàng (userId, restaurantId, items)");
    }

    if (!orderData.shippingAddress || !orderData.shippingAddress.text) {
      throw new Error("Vui lòng cung cấp địa chỉ giao hàng");
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