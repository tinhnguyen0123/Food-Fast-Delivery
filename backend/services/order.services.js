import OrderRepository from "../repositories/order.repositories.js";
import ProductRepository from "../repositories/product.repositories.js";
import DeliveryRepository from "../repositories/delivery.repositories.js";
import DroneRepository from "../repositories/drone.repositories.js";
import RestaurantRepository from "../repositories/restaurant.repositories.js";
import DroneMovementService from "./droneMovement.services.js";

class OrderService {
  // 🔹 Tạo đơn hàng — có thể gồm nhiều nhà hàng
  async createOrder(orderData) {
    if (!orderData || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      throw new Error("Thiếu thông tin đơn hàng (items)");
    }
    if (!orderData.userId) throw new Error("Thiếu thông tin đơn hàng (userId)");
    if (!orderData.shippingAddress || !orderData.shippingAddress.text) {
      throw new Error("Vui lòng cung cấp địa chỉ giao hàng");
    }

    const productCache = new Map();
    const groups = new Map();

    for (const it of orderData.items) {
      const pid = it.productId;
      const qty = Number(it.quantity || 0);
      if (!pid || qty <= 0) continue;

      let product = productCache.get(pid);
      if (!product) {
        product = await ProductRepository.getProductById(pid);
        if (!product) throw new Error(`Sản phẩm không tồn tại: ${pid}`);
        productCache.set(pid, product);
      }

      if (product.available === false) throw new Error(`Món ăn '${product.name}' không còn khả dụng`);

      const restId = product.restaurantId?._id || product.restaurantId;
      if (!restId) throw new Error(`Món ăn '${product.name}' không còn khả dụng`);

      const restaurant = await RestaurantRepository.getRestaurantById(restId);
      if (!restaurant || restaurant.status !== "verified") {
        throw new Error(`Nhà hàng của món '${product.name}' hiện không hoạt động`);
      }

      const rid = product?.restaurantId?._id?.toString?.() || product?.restaurantId?.toString?.();
      if (!rid) throw new Error(`Không xác định được nhà hàng của sản phẩm: ${pid}`);

      if (!groups.has(rid)) groups.set(rid, { items: [], totalPrice: 0 });

      const priceNow = Number(product.price || 0);
      const g = groups.get(rid);
      g.items.push({ productId: pid, quantity: qty, priceAtOrderTime: priceNow, name: product.name });
      g.totalPrice += priceNow * qty;
    }

    if (groups.size === 0) throw new Error("Không có món hợp lệ trong đơn hàng");

    if (groups.size === 1) {
      const [rid, group] = Array.from(groups.entries())[0];
      const payload = {
        userId: orderData.userId,
        restaurantId: orderData.restaurantId || rid,
        items: group.items,
        totalPrice: group.totalPrice,
        paymentMethod: orderData.paymentMethod || "COD",
        shippingAddress: orderData.shippingAddress,
        note: orderData.note || "",
        status: orderData.status || "pending",
        paymentId: orderData.paymentId || undefined,
        deliveryId: orderData.deliveryId || undefined,
      };
      return await OrderRepository.createOrder(payload);
    }

    const createdOrders = [];
    for (const [rid, group] of groups.entries()) {
      const payload = {
        userId: orderData.userId,
        restaurantId: rid,
        items: group.items,
        totalPrice: group.totalPrice,
        paymentMethod: orderData.paymentMethod || "COD",
        shippingAddress: orderData.shippingAddress,
        note: orderData.note || "",
        status: orderData.status || "pending",
      };
      const created = await OrderRepository.createOrder(payload);
      createdOrders.push(created);
    }

    return createdOrders;
  }

  async getAllOrders() {
    return await OrderRepository.getAllOrders();
  }

  async getOrderById(orderId) {
    const order = await OrderRepository.getOrderById(orderId, [
      { path: "userId", select: "name email" },
      {
        path: "restaurantId",
        select: "name address locationId",
        populate: { path: "locationId", select: "coords address" },
      },
      { path: "paymentId" },
      { path: "deliveryId" },
      { path: "items.productId", select: "name image" },
    ]);

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
    const existingOrder = await OrderRepository.getOrderById(orderId);
    if (!existingOrder) throw new Error("Không tìm thấy đơn hàng để cập nhật");

    const updated = await OrderRepository.updateOrder(orderId, updateData);
    if (!updated) throw new Error("Cập nhật đơn hàng thất bại");

    if (updateData.status === "completed" && existingOrder.deliveryId) {
      const delivery = await DeliveryRepository.getDeliveryById(existingOrder.deliveryId);
      if (delivery && delivery.droneId) {
        await DroneRepository.updateDrone(delivery.droneId, { status: "idle" });
      }
    }

    return updated;
  }

  async deleteOrder(orderId) {
    const deleted = await OrderRepository.deleteOrder(orderId);
    if (!deleted) throw new Error("Xóa đơn hàng thất bại");
    return deleted;
  }

  // ✅ Khách hàng xác nhận đã nhận hàng
  async confirmCompletedByCustomer(orderId, userId) {
    const order = await OrderRepository.getOrderById(orderId);
    if (!order) throw new Error("Không tìm thấy đơn hàng");

    if (String(order.userId?._id || order.userId) !== String(userId)) {
      throw new Error("Bạn không thể xác nhận đơn hàng không thuộc về bạn");
    }

    if (order.status !== "delivering") throw new Error("Chỉ có thể xác nhận khi đơn đang giao");

    // Dừng movement nếu drone đang di chuyển
    const delivery = order.deliveryId ? await DeliveryRepository.getDeliveryById(order.deliveryId) : null;
    if (delivery?.droneId) {
      DroneMovementService.stopMovement(delivery.droneId);
    }

    // Cập nhật trạng thái đơn hàng
    const updatedOrder = await this.updateOrder(orderId, { status: "completed" });
    return updatedOrder;
  }
}

export default new OrderService();
