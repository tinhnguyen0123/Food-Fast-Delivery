import DeliveryService from "../services/delivery.services.js";
import DeliveryRepository from "../repositories/delivery.repositories.js";

class DeliveryController {
  // 🔹 Tạo delivery mới
  async create(req, res) {
    try {
      const delivery = await DeliveryService.createDelivery(req.body);
      res.status(201).json(delivery);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // 🔹 Lấy delivery theo ID
  async getById(req, res) {
    try {
      const delivery = await DeliveryService.getDeliveryById(req.params.id);
      res.status(200).json(delivery);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  // 🔹 Lấy danh sách delivery theo drone
  async getByDrone(req, res) {
    try {
      const deliveries = await DeliveryService.getDeliveriesByDrone(req.params.droneId);
      res.status(200).json(deliveries);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // 🔹 Lấy delivery theo orderId (chuẩn theo code mẫu)
  async getByOrder(req, res) {
    try {
      const { orderId } = req.params;
      const delivery = await DeliveryRepository.getDeliveryByOrderId(orderId);
      if (!delivery) return res.status(404).json({ message: "Delivery not found" });
      res.json(delivery);
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  }

  // 🔹 Cập nhật delivery
  async update(req, res) {
    try {
      const updated = await DeliveryService.updateDelivery(req.params.id, req.body);
      res.status(200).json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // 🔹 Xóa delivery
  async delete(req, res) {
    try {
      const deleted = await DeliveryService.deleteDelivery(req.params.id);
      res.status(200).json(deleted);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

export default new DeliveryController();
