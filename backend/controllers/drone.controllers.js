import DroneService from "../services/drone.services.js";

class DroneController {
  // ✅ Tạo drone mới (có kiểm tra restaurantId)
  async create(req, res) {
    try {
      const drone = await DroneService.createDrone(req.body);
      res.status(201).json(drone);
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  }

  // ✅ Lấy tất cả drone
  async getAll(req, res) {
    try {
      const drones = await DroneService.getAllDrones();
      res.status(200).json(drones);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // ✅ Lấy danh sách drone theo nhà hàng
  async getByRestaurant(req, res) {
    try {
      const drones = await DroneService.getDronesByRestaurant(req.params.restaurantId);
      res.status(200).json(drones);
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  }

  // Lấy drone theo ID
  async getById(req, res) {
    try {
      const drone = await DroneService.getDroneById(req.params.id);
      res.status(200).json(drone);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  // Lấy drone theo trạng thái
  async getByStatus(req, res) {
    try {
      const drones = await DroneService.getDronesByStatus(req.params.status);
      res.status(200).json(drones);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  // Cập nhật drone
  async update(req, res) {
    try {
      const updated = await DroneService.updateDrone(req.params.id, req.body);
      res.status(200).json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Xóa drone
  async delete(req, res) {
    try {
      const deleted = await DroneService.deleteDrone(req.params.id);
      res.status(200).json(deleted);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // ✅ Gán drone thủ công cho 1 đơn hàng
  async assign(req, res) {
    try {
      const { droneId, orderId } = req.body;
      const result = await DroneService.assignDrone(droneId, orderId);
      res.status(200).json({ message: "Gán drone thành công", ...result });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  }

  // ✅ Phân bổ tự động tất cả đơn "preparing" cho drone "idle"
  async autoAssign(req, res) {
    try {
      const restaurantId = req.body.restaurantId || req.params.restaurantId;
      const result = await DroneService.autoAssignForRestaurant(restaurantId);
      res.status(200).json(result);
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  }
}

export default new DroneController();
