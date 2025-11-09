import OrderRepository from "../repositories/order.repositories.js";
import ProductRepository from "../repositories/product.repositories.js";
import DeliveryRepository from "../repositories/delivery.repositories.js"; // Thêm import DeliveryRepository
import DroneRepository from "../repositories/drone.repositories.js"; // Thêm import DroneRepository

class OrderService {
  // 🔹 Chỉnh sửa createOrder để gom nhóm theo nhà hàng
  async createOrder(orderData) {
    if (!orderData || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      throw new Error("Thiếu thông tin đơn hàng (items)");
    }
    if (!orderData.userId) {
      throw new Error("Thiếu thông tin đơn hàng (userId)");
    }
    if (!orderData.shippingAddress || !orderData.shippingAddress.text) {
      throw new Error("Vui lòng cung cấp địa chỉ giao hàng");
    }

    // Tải thông tin sản phẩm cho tất cả items và nhóm theo restaurantId
    const productCache = new Map();
    const groups = new Map(); // key = restaurantId, value = { items, totalPrice }

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

      const rid =
        product?.restaurantId?._id?.toString?.() ||
        product?.restaurantId?.toString?.();
      if (!rid) throw new Error(`Không xác định được nhà hàng của sản phẩm: ${pid}`);

      if (!groups.has(rid)) {
        groups.set(rid, { items: [], totalPrice: 0 });
      }

      const priceNow = Number(product.price || 0);
      const g = groups.get(rid);
      // ✅ Lưu snapshot giá & tên tại thời điểm đặt
      g.items.push({
        productId: pid,
        quantity: qty,
        priceAtOrderTime: priceNow,
        name: product.name,
      });
      g.totalPrice += priceNow * qty;
    }

    if (groups.size === 0) {
      throw new Error("Không có món hợp lệ trong đơn hàng");
    }

    // Nếu chỉ có 1 nhà hàng → hành vi cũ
    if (groups.size === 1) {
      const [rid, group] = Array.from(groups.entries())[0];
      const payload = {
        userId: orderData.userId,
        restaurantId: orderData.restaurantId || rid,
        items: group.items,
        totalPrice: group.totalPrice,
        paymentMethod: orderData.paymentMethod || "COD", // ✅ thêm mặc định
        shippingAddress: orderData.shippingAddress,
        note: orderData.note || "",
        status: orderData.status || "pending",
        paymentId: orderData.paymentId || undefined,
        deliveryId: orderData.deliveryId || undefined,
      };
      return await OrderRepository.createOrder(payload);
    }

    // Nếu nhiều nhà hàng → tạo nhiều đơn nhỏ
    const createdOrders = [];
    for (const [rid, group] of groups.entries()) {
      const payload = {
        userId: orderData.userId,
        restaurantId: rid,
        items: group.items,
        totalPrice: group.totalPrice,
        paymentMethod: orderData.paymentMethod || "COD", // ✅ thêm mặc định
        shippingAddress: orderData.shippingAddress,
        note: orderData.note || "",
        status: orderData.status || "pending",
      };
      const created = await OrderRepository.createOrder(payload);
      createdOrders.push(created);
    }

    // Trả về mảng các đơn đã tạo
    return createdOrders;
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
    // Lấy thông tin đơn hàng hiện tại trước khi cập nhật
    const existingOrder = await OrderRepository.getOrderById(orderId);
    if (!existingOrder) {
      throw new Error("Không tìm thấy đơn hàng để cập nhật");
    }

    const updated = await OrderRepository.updateOrder(orderId, updateData);
    if (!updated) throw new Error("Cập nhật đơn hàng thất bại");

    // Nếu trạng thái đơn hàng được cập nhật thành 'completed' và có deliveryId
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
}

export default new OrderService();
