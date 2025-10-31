import DeliveryService from "../services/delivery.services.js";

class DeliveryController {
  async create(req, res) {
    try {
      const delivery = await DeliveryService.createDelivery(req.body);
      res.status(201).json(delivery);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const delivery = await DeliveryService.getDeliveryById(req.params.id);
      res.status(200).json(delivery);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  async getByDrone(req, res) {
    try {
      const deliveries = await DeliveryService.getDeliveriesByDrone(req.params.droneId);
      res.status(200).json(deliveries);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getByOrder(req, res) {
    try {
      const deliveries = await DeliveryService.getDeliveriesByOrder(req.params.orderId);
      res.status(200).json(deliveries);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async update(req, res) {
    try {
      const updated = await DeliveryService.updateDelivery(req.params.id, req.body);
      res.status(200).json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

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
