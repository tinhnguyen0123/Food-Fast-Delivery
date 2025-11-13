import DroneRepository from "../repositories/drone.repositories.js";
import DeliveryRepository from "../repositories/delivery.repositories.js";
import LocationRepository from "../repositories/location.repositories.js";
import OrderRepository from "../repositories/order.repositories.js";

class DroneMovementService {
  constructor() {
    this.activeMovements = new Map(); // droneId -> interval
  }

  // ✅ Tạo đường thẳng giữa 2 điểm
  createStraightRoute(from, to, steps = 20) {
    const route = [];
    for (let i = 0; i <= steps; i++) {
      const ratio = i / steps;
      const lat = from.lat + (to.lat - from.lat) * ratio;
      const lng = from.lng + (to.lng - from.lng) * ratio;
      route.push({ lat, lng });
    }
    return route;
  }

  // Bắt đầu di chuyển drone theo delivery
  async startMovement(deliveryId) {
    try {
      const delivery = await DeliveryRepository.getDeliveryById(deliveryId);
      if (!delivery || !delivery.droneId) return;

      const drone = delivery.droneId;
      const pickup = delivery.pickupLocationId?.coords;
      const dropoff = delivery.dropoffLocationId?.coords;

      if (!pickup || !dropoff) {
        console.warn("Missing pickup/dropoff coords for delivery", deliveryId);
        return;
      }

      // ✅ Tạo đường thẳng
      const route = this.createStraightRoute(pickup, dropoff, 20);

      if (route.length === 0) {
        console.warn("No route created for delivery", deliveryId);
        return;
      }

      // Dừng movement cũ nếu có
      this.stopMovement(drone._id);

      let currentIndex = 0;
      const totalSteps = route.length;
      const intervalMs = 3000; // cập nhật mỗi 3s

      console.log(`🚁 Drone ${drone.code} bắt đầu bay thẳng với ${totalSteps} điểm`);

      const interval = setInterval(async () => {
        try {
          if (currentIndex >= totalSteps) {
            await this.stopMovement(drone._id);

            // ✅ Cập nhật delivery status = "arrived"
            await DeliveryRepository.updateDelivery(delivery._id, {
              status: "arrived",
            });

            // ✅ Cập nhật order để frontend biết drone đã tới
            await OrderRepository.updateOrder(delivery.orderId, {
              arrivedNotified: true,
            });

            console.log(`✅ Drone ${drone.code} đã đến đích`);
            return;
          }

          const currentPos = route[currentIndex];
          let locationId = drone.currentLocationId?._id || drone.currentLocationId;

          if (locationId) {
            // Cập nhật vị trí hiện tại
            await LocationRepository.updateLocation(locationId, {
              coords: { lat: currentPos.lat, lng: currentPos.lng },
            });
          } else {
            // Tạo location mới
            const newLoc = await LocationRepository.createLocation({
              type: "drone",
              coords: { lat: currentPos.lat, lng: currentPos.lng },
              address: `Drone ${drone.code} position`,
            });
            locationId = newLoc._id;
            await DroneRepository.updateDrone(drone._id, {
              currentLocationId: locationId,
            });
          }

          console.log(
            `🚁 Drone ${drone.code} tại [${currentPos.lat.toFixed(
              5
            )}, ${currentPos.lng.toFixed(5)}] (${currentIndex + 1}/${totalSteps})`
          );

          currentIndex++;
        } catch (err) {
          console.error("Movement interval error:", err);
        }
      }, intervalMs);

      this.activeMovements.set(drone._id.toString(), interval);
    } catch (e) {
      console.error("startMovement error:", e);
    }
  }

  // Dừng di chuyển drone
  stopMovement(droneId) {
    const key = droneId.toString();
    if (this.activeMovements.has(key)) {
      clearInterval(this.activeMovements.get(key));
      this.activeMovements.delete(key);
      console.log(`🛑 Stopped movement for drone ${droneId}`);
    }
  }

  // Dừng tất cả movement (khi server shutdown)
  stopAll() {
    for (const [id, interval] of this.activeMovements) {
      clearInterval(interval);
    }
    this.activeMovements.clear();
  }
}

export default new DroneMovementService();
