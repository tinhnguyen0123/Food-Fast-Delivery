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

  // ✅ Bắt đầu di chuyển drone theo delivery
  // ...existing code...
async startMovement(deliveryId) {
  try {
    const delivery = await DeliveryRepository.getDeliveryById(deliveryId);
    if (!delivery) throw new Error("Không tìm thấy delivery");

    const drone = delivery.droneId;
    const pickup = delivery.pickupLocationId?.coords; // Nhà hàng
    const dropoff = delivery.dropoffLocationId?.coords; // Khách hàng

    if (!pickup || !dropoff) {
      console.log("Thiếu tọa độ pickup hoặc dropoff");
      return;
    }

    // ✅ Set vị trí drone về nhà hàng trước khi bay
    let locationId = drone.currentLocationId?._id || drone.currentLocationId;
    
    if (locationId) {
      await LocationRepository.updateLocation(locationId, {
        coords: { lat: pickup.lat, lng: pickup.lng },
      });
    } else {
      const newLoc = await LocationRepository.createLocation({
        type: "drone",
        coords: { lat: pickup.lat, lng: pickup.lng },
        address: `Drone ${drone.code} at restaurant`,
      });
      locationId = newLoc._id;
      await DroneRepository.updateDrone(drone._id, { 
        currentLocationId: locationId 
      });
    }

    // ✅ Tạo route từ nhà hàng (pickup) đến khách hàng (dropoff)
    const route = this.createStraightRoute(pickup, dropoff, 20);
    if (route.length === 0) return;

    this.stopMovement(drone._id);

    let currentIndex = 0;
    const totalSteps = route.length;
    const intervalMs = 3000;

    console.log(`🚁 Drone ${drone.code} bắt đầu bay từ nhà hàng với ${totalSteps} điểm`);

    const interval = setInterval(async () => {
      try {
        if (currentIndex >= totalSteps) {
          await this.stopMovement(drone._id);
          await DeliveryRepository.updateDelivery(delivery._id, { status: "arrived" });
          await OrderRepository.updateOrder(delivery.orderId, { arrivedNotified: true });
          console.log(`✅ Drone ${drone.code} đã đến đích`);
          return;
        }

        const currentPos = route[currentIndex];

        // Cập nhật vị trí
        await LocationRepository.updateLocation(locationId, {
          coords: { lat: currentPos.lat, lng: currentPos.lng },
        });

        console.log(
          `🚁 Drone ${drone.code} tại [${currentPos.lat.toFixed(5)}, ${currentPos.lng.toFixed(
            5
          )}] (${currentIndex + 1}/${totalSteps})`
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
// ...existing code...

  // ✅ Quay về nhà hàng sau khi giao (dropoff -> pickup)
    // ✅ Quay về nhà hàng sau khi giao (dropoff -> pickup)
  async startReturnToBase(delivery) {
    try {
      const drone = delivery.droneId;
      const pickup = delivery.pickupLocationId?.coords;
      const dropoff = delivery.dropoffLocationId?.coords;
      if (!pickup || !dropoff) return;

      const routeBack = this.createStraightRoute(dropoff, pickup, 20);
      if (routeBack.length === 0) return;

      // Dừng movement cũ nếu có
      this.stopMovement(drone._id);

      let idx = 0;
      const total = routeBack.length;
      const intervalMs = 3000;

      console.log(`↩️ Drone ${drone.code} quay về nhà hàng với ${total} điểm`);

      const interval = setInterval(async () => {
        try {
          // --------------------------
          //   ⬇️⬇️ Đây là đoạn bạn yêu cầu sửa
          // --------------------------
          if (idx >= total) {
            await this.stopMovement(drone._id);

            // Cập nhật vị trí cuối cùng = vị trí nhà hàng (pickup)
            let locationId = drone.currentLocationId?._id || drone.currentLocationId;

            if (locationId) {
              await LocationRepository.updateLocation(locationId, {
                coords: { lat: pickup.lat, lng: pickup.lng },
              });
            } else {
              const newLoc = await LocationRepository.createLocation({
                type: "drone",
                coords: { lat: pickup.lat, lng: pickup.lng },
                address: `Drone ${drone.code} at restaurant`,
              });
              locationId = newLoc._id;
              await DroneRepository.updateDrone(drone._id, {
                currentLocationId: locationId,
              });
            }

            // 👉 Set trạng thái idle để drone sẵn sàng nhận đơn mới
            await DroneRepository.updateDrone(drone._id, { status: "idle" });

            console.log(`🏠 Drone ${drone.code} đã về nhà hàng và sẵn sàng`);
            return;
          }
          // --------------------------
          //   ⬆️⬆️ Kết thúc đoạn sửa
          // --------------------------

          // Cập nhật vị trí đang di chuyển
          const pos = routeBack[idx];
          let locationId = drone.currentLocationId?._id || drone.currentLocationId;

          if (locationId) {
            await LocationRepository.updateLocation(locationId, {
              coords: { lat: pos.lat, lng: pos.lng },
            });
          } else {
            const newLoc = await LocationRepository.createLocation({
              type: "drone",
              coords: { lat: pos.lat, lng: pos.lng },
              address: `Drone ${drone.code} returning`,
            });
            locationId = newLoc._id;
            await DroneRepository.updateDrone(drone._id, {
              currentLocationId: locationId,
            });
          }

          console.log(
            `↩️ Drone ${drone.code} về nhà hàng tại [${pos.lat.toFixed(
              5
            )}, ${pos.lng.toFixed(5)}] (${idx + 1}/${total})`
          );

          idx++;
        } catch (err) {
          console.error("Return interval error:", err);
        }
      }, intervalMs);

      this.activeMovements.set(drone._id.toString(), interval);
    } catch (e) {
      console.error("startReturnToBase error:", e);
    }
  }


  // ✅ Dừng di chuyển drone
  stopMovement(droneId) {
    const key = droneId.toString();
    if (this.activeMovements.has(key)) {
      clearInterval(this.activeMovements.get(key));
      this.activeMovements.delete(key);
      console.log(`🛑 Stopped movement for drone ${droneId}`);
    }
  }

  // ✅ Dừng tất cả movement (khi server shutdown)
  stopAll() {
    for (const [id, interval] of this.activeMovements) {
      clearInterval(interval);
    }
    this.activeMovements.clear();
  }
}

export default new DroneMovementService();
