import DroneRepository from "../repositories/drone.repositories.js";
import DeliveryRepository from "../repositories/delivery.repositories.js";
import OrderRepository from "../repositories/order.repositories.js";

class DroneService {
  // ✅ Tạo drone mới — yêu cầu có restaurantId
  async createDrone(data) {
    if (!data.code) throw new Error("Thiếu mã drone");
    if (!data.restaurantId) throw new Error("Thiếu restaurantId");

    return await DroneRepository.createDrone({
      code: data.code,
      name: data.name || data.code,
      restaurantId: data.restaurantId,
      status: data.status || "idle",
      batteryLevel: data.batteryLevel ?? data.battery ?? 100,
      capacity: data.capacity ?? 5,
    });
  }

  async getDroneById(id) {
    const drone = await DroneRepository.getDroneById(id);
    if (!drone) throw new Error("Drone không tồn tại");
    return drone;
  }

  async getAllDrones() {
    return await DroneRepository.getAllDrones();
  }

  async getDronesByStatus(status) {
    return await DroneRepository.getDronesByStatus(status);
  }

  // ✅ Lấy danh sách drone theo nhà hàng
  async getDronesByRestaurant(restaurantId) {
    if (!restaurantId) throw new Error("Thiếu restaurantId");
    return await DroneRepository.getDronesByRestaurant(restaurantId);
  }

  async updateDrone(id, data) {
    const updated = await DroneRepository.updateDrone(id, data);
    if (!updated) throw new Error("Cập nhật drone thất bại");
    return updated;
  }

  async deleteDrone(id) {
    const deleted = await DroneRepository.deleteDrone(id);
    if (!deleted) throw new Error("Drone không tồn tại hoặc đã bị xóa");
    return deleted;
  }

  // ✅ Gán drone cho đơn hàng — kiểm tra nhà hàng trùng khớp
  async assignDrone(droneId, orderId) {
    if (!droneId || !orderId) throw new Error("Thiếu droneId hoặc orderId");

    const order = await OrderRepository.getOrderById(orderId);
    if (!order) throw new Error("Đơn hàng không tồn tại");
    if (order.status !== "preparing") {
      throw new Error("Chỉ có thể gán drone khi đơn đang chuẩn bị");
    }

    const drone = await DroneRepository.getDroneById(droneId);
    if (!drone) throw new Error("Drone không tồn tại");
    if (drone.status !== "idle") throw new Error("Drone không sẵn sàng");

    // --- CHANGED: so sánh ID an toàn, chấp nhận trường hợp order.restaurantId đã được populate
    const orderRestaurantId = order.restaurantId?._id || order.restaurantId;
    console.debug("assignDrone debug:", {
      droneRestaurantId: String(drone.restaurantId),
      orderRestaurantId: String(orderRestaurantId),
      drone,
      order: { _id: order._id, restaurantId: order.restaurantId },
    });
    if (!orderRestaurantId || String(drone.restaurantId) !== String(orderRestaurantId)) {
      throw new Error("Drone không thuộc nhà hàng của đơn này");
    }

    // ✅ Tạo bản ghi delivery
    const delivery = await DeliveryRepository.createDelivery({
      orderId: order._id,
      droneId: drone._id,
      status: "on_the_way",
      startedAt: new Date(),
    });

    // ✅ Cập nhật trạng thái đơn
    await OrderRepository.updateOrder(order._id, {
      status: "delivering",
      deliveryId: delivery._id,
    });

    // ✅ Cập nhật trạng thái drone
    const updatedDrone = await DroneRepository.updateDrone(drone._id, {
      status: "delivering",
    });

    return { delivery, orderId: order._id, drone: updatedDrone };
  }

  // ✅ Tự động phân bổ drone cho đơn của nhà hàng
  async autoAssignForRestaurant(restaurantId) {
    if (!restaurantId) throw new Error("Thiếu restaurantId");

    const orders = await OrderRepository.getOrdersByRestaurant(restaurantId);
    const waiting = orders.filter((o) => o.status === "preparing");

    const idleDrones = await this.getDronesByRestaurant(restaurantId)
      .then((list) => list.filter((d) => d.status === "idle"));

    const results = [];
    let idx = 0;
    for (const order of waiting) {
      if (idx >= idleDrones.length) break;
      const drone = idleDrones[idx++];
      const r = await this.assignDrone(drone._id, order._id);
      results.push(r);
    }

    return { assigned: results.length, details: results };
  }
}

export default new DroneService();
