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

  // ✅ Cập nhật trạng thái drone (bảo trì/sẵn sàng)
  async updateDroneStatus(id, status) {
    if (!["idle", "maintenance"].includes(status)) {
      throw new Error("Trạng thái không hợp lệ. Chỉ chấp nhận 'idle' hoặc 'maintenance'.");
    }
    const drone = await this.getDroneById(id);
    if (["delivering", "returning"].includes(drone.status)) {
      throw new Error("Không thể thay đổi trạng thái khi drone đang hoạt động.");
    }
    return await this.updateDrone(id, { status });
  }

  // ✅ Sạc đầy pin cho drone
  async chargeDrone(id) {
    const drone = await this.getDroneById(id);
    if (["delivering", "returning"].includes(drone.status)) {
      throw new Error("Không thể sạc khi drone đang hoạt động.");
    }
    // Giả lập quá trình sạc trong 3 giây rồi set về idle
    await this.updateDrone(id, { status: "charging" });
    setTimeout(async () => {
      await this.updateDrone(id, { batteryLevel: 100, status: "idle" });
      console.log(`🔋 Drone ${id} đã sạc đầy và chuyển sang 'idle'.`);
    }, 3000);

    return { message: `Bắt đầu sạc pin cho drone ${id}.` };
  }

  async deleteDrone(id) {
    const deleted = await DroneRepository.deleteDrone(id);
    if (!deleted) throw new Error("Drone không tồn tại hoặc đã bị xóa");
    return deleted;
  }

  // ✅ Gán drone cho đơn hàng nhưng CHƯA bay
  async assignDrone(droneId, orderId) {
    if (!droneId || !orderId) throw new Error("Thiếu droneId hoặc orderId");

    const order = await OrderRepository.getOrderById(orderId);
    if (!order) throw new Error("Đơn hàng không tồn tại");

    if (order.status !== "ready") {
      throw new Error("Chỉ có thể gán drone khi đơn ở trạng thái 'ready'");
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

    // Tạo delivery trạng thái "waiting"
    const delivery = await DeliveryRepository.createDelivery({
      orderId: order._id,
      droneId: drone._id,
      pickupLocationId: pickupLocId || undefined,
      dropoffLocationId: dropoffLocId || undefined,
      status: "waiting",
      startedAt: null,
    });

    // Ghi deliveryId vào order, giữ nguyên trạng thái "ready"
    await OrderRepository.updateOrder(order._id, { deliveryId: delivery._id });

    // KHÔNG đổi trạng thái drone, giữ nguyên drone
    return { delivery, orderId: order._id, drone };
  }

  // ...existing code...
  // ✅ Bắt đầu giao: chuyển trạng thái và khởi động drone
  async startDelivery(deliveryId) {
    if (!deliveryId) throw new Error("Thiếu deliveryId");

    const delivery = await DeliveryRepository.getDeliveryById(deliveryId);
    if (!delivery) throw new Error("Không tìm thấy delivery");
    if (!delivery.droneId) throw new Error("Delivery chưa có drone");

    const order = await OrderRepository.getOrderById(delivery.orderId);
    if (!order) throw new Error("Không tìm thấy đơn hàng");
    if (order.status !== "ready") throw new Error("Chỉ bắt đầu giao khi đơn ở trạng thái 'ready'");

    const drone = delivery.droneId;
    const pickupLocation = delivery.pickupLocationId;

    // ✅ Đặt drone về vị trí nhà hàng trước khi bay
    if (pickupLocation?.coords) {
      let locationId = drone.currentLocationId?._id || drone.currentLocationId;
      
      if (locationId) {
        await LocationRepository.updateLocation(locationId, {
          coords: { 
            lat: pickupLocation.coords.lat, 
            lng: pickupLocation.coords.lng 
          },
        });
      } else {
        const newLoc = await LocationRepository.createLocation({
          type: "drone",
          coords: { 
            lat: pickupLocation.coords.lat, 
            lng: pickupLocation.coords.lng 
          },
          address: `Drone ${drone.code} at restaurant`,
        });
        await DroneRepository.updateDrone(drone._id, { 
          currentLocationId: newLoc._id 
        });
      }
    }

    // Cập nhật trạng thái
    await DroneRepository.updateDrone(delivery.droneId._id, { status: "delivering" });
    await DeliveryRepository.updateDelivery(delivery._id, { 
      status: "on_the_way", 
      startedAt: new Date() 
    });
    await OrderRepository.updateOrder(order._id, { status: "delivering" });

    // Khởi động di chuyển
    setImmediate(() => {
      DroneMovementService.startMovement(delivery._id).catch((err) =>
        console.error("Failed to start drone movement:", err)
      );
    });

    return { message: "Delivery started" };
  }
// ...existing code...

  // ✅ Tự động gán tất cả drone idle cho các đơn "ready"
  async autoAssignForRestaurant(restaurantId) {
    if (!restaurantId) throw new Error("Thiếu restaurantId");

    // Lọc đơn trạng thái "ready" thay vì "preparing"
    const orders = await OrderRepository.getOrdersByRestaurant(restaurantId);
    const waiting = orders.filter((o) => o.status === "ready");

    const idleDrones = await this.getDronesByRestaurant(restaurantId)
      .then((list) => list.filter((d) => d.status === "idle" && (d.batteryLevel ?? 0) >= 20));

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
