import OrderService from "../services/order.services.js";

class OrderController {
  async create(req, res) {
    try {
      const created = await OrderService.createOrder(req.body);
      res.status(201).json(created);
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  }

  async getById(req, res) {
    try {
      const order = await OrderService.getOrderById(req.params.id);
      res.status(200).json(order);
    } catch (e) {
      res.status(404).json({ message: e.message });
    }
  }

  async getByUser(req, res) {
    try {
      const orders = await OrderService.getOrdersByUser(req.params.userId);
      res.status(200).json(orders);
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  }

  async getByRestaurant(req, res) {
    try {
      const orders = await OrderService.getOrdersByRestaurant(req.params.restaurantId);
      res.status(200).json(orders);
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  }

  async getByStatus(req, res) {
    try {
      const orders = await OrderService.getOrdersByStatus(req.params.status);
      res.status(200).json(orders);
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  }

  async update(req, res) {
    try {
      const updated = await OrderService.updateOrder(req.params.id, req.body);
      res.status(200).json(updated);
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  }

  async delete(req, res) {
    try {
      const deleted = await OrderService.deleteOrder(req.params.id);
      res.status(200).json(deleted);
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  }
}

export default new OrderController();