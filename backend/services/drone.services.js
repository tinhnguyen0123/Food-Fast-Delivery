import DroneRepository from "../repositories/drone.repositories.js";
import DeliveryRepository from "../repositories/delivery.repositories.js";
import OrderRepository from "../repositories/order.repositories.js";
import RestaurantRepository from "../repositories/restaurant.repositories.js";
import LocationRepository from "../repositories/location.repositories.js";
import DroneMovementService from "./droneMovement.services.js";

class DroneService {
  // ✅ Tạo drone mới — yêu cầu có restaurantId
  async createDrone(data) {
    if (!data.code) throw new Error("Thiếu mã drone");
    if (!data.restaurantId) throw new Error("Thiếu restaurantId");

    const restaurant = await RestaurantRepository.getRestaurantById(data.restaurantId);
    if (!restaurant) throw new Error("Nhà hàng không tồn tại");
    if (restaurant.status === "suspended") throw new Error("Nhà hàng đã bị khóa");
    if (restaurant.status !== "verified") throw new Error("Nhà hàng chưa được duyệt");

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

  // ✅ Gán drone cho đơn hàng và khởi chạy di chuyển
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

    const orderRestaurantId = order.restaurantId?._id || order.restaurantId;
    if (!orderRestaurantId || String(drone.restaurantId) !== String(orderRestaurantId)) {
      throw new Error("Drone không thuộc nhà hàng của đơn này");
    }

    const restaurant = await RestaurantRepository.getRestaurantById(orderRestaurantId);
    const pickupLocId = restaurant?.locationId?._id || restaurant?.locationId || null;

    let dropoffLocId = null;
    const shipping = order?.shippingAddress;
    if (shipping?.location?.lat && shipping?.location?.lng) {
      const createdDrop = await LocationRepository.createLocation({
        type: "user",
        coords: { lat: shipping.location.lat, lng: shipping.location.lng },
        address: shipping.text || shipping.address || "",
      });
      dropoffLocId = createdDrop?._id;
    }

    const delivery = await DeliveryRepository.createDelivery({
      orderId: order._id,
      droneId: drone._id,
      pickupLocationId: pickupLocId || undefined,
      dropoffLocationId: dropoffLocId || undefined,
      status: "on_the_way",
      startedAt: new Date(),
    });

    await OrderRepository.updateOrder(order._id, {
      status: "delivering",
      deliveryId: delivery._id,
    });

    const updateDronePayload = { status: "delivering" };
    if (!drone.currentLocationId && pickupLocId) {
      updateDronePayload.currentLocationId = pickupLocId;
    }
    const updatedDrone = await DroneRepository.updateDrone(drone._id, updateDronePayload);

    // ✅ Bắt đầu di chuyển drone theo delivery route
    setImmediate(() => {
      DroneMovementService.startMovement(delivery._id).catch((err) =>
        console.error("Failed to start drone movement:", err)
      );
    });

    return { delivery, orderId: order._id, drone: updatedDrone };
  }

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
