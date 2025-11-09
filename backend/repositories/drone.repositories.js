import Drone from "../models/drone.models.js";

class DroneRepository {
  // Tạo drone mới
  async createDrone(droneData) {
    const drone = new Drone(droneData);
    return await drone.save();
  }

  // Lấy drone theo ID
  async getDroneById(droneId) {
    return await Drone.findById(droneId).populate("currentLocationId");
  }

  // Lấy tất cả drone
  async getAllDrones() {
    return await Drone.find().populate("currentLocationId").sort({ createdAt: -1 });
  }

  // Lấy drone theo trạng thái
  async getDronesByStatus(status) {
    return await Drone.find({ status }).populate("currentLocationId").sort({ createdAt: -1 });
  }

  async getDronesByRestaurant(restaurantId) {
    return await Drone.find({ restaurantId })
      .populate("currentLocationId")
      .sort({ createdAt: -1 });
  }

  // Cập nhật drone
  async updateDrone(droneId, updateData) {
    return await Drone.findByIdAndUpdate(droneId, updateData, { new: true });
  }

  // Xóa drone
  async deleteDrone(droneId) {
    return await Drone.findByIdAndDelete(droneId);
  }

  // ✅ Gán drone cho đơn hàng → tự động set status = "delivering"
  async assignDrone(droneId, orderId) {
    return await Drone.findByIdAndUpdate(
      droneId,
      { status: "delivering" },
      { new: true }
    );
  }
}

export default new DroneRepository();
