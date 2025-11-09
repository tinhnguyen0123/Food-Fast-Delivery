import OrderService from "../services/order.services.js";

class OrderController {
  // ✅ Tạo đơn hàng
  async create(req, res) {
    try {
      const created = await OrderService.createOrder(req.body);
      res.status(201).json(created);
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  }

  // ✅ Lấy đơn hàng theo ID
  async getById(req, res) {
    try {
      const order = await OrderService.getOrderById(req.params.id);
      res.status(200).json(order);
    } catch (e) {
      res.status(404).json({ message: e.message });
    }
  }

  // ✅ Lấy danh sách đơn hàng theo User
  async getByUser(req, res) {
    try {
      const orders = await OrderService.getOrdersByUser(req.params.userId);
      res.status(200).json(orders);
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  }

  // ✅ Lấy danh sách đơn hàng theo nhà hàng
  async getByRestaurant(req, res) {
    try {
      const orders = await OrderService.getOrdersByRestaurant(req.params.restaurantId);
      res.status(200).json(orders);
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  }

  // ✅ Lấy danh sách đơn hàng theo trạng thái
  async getByStatus(req, res) {
    try {
      const orders = await OrderService.getOrdersByStatus(req.params.status);
      res.status(200).json(orders);
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  }

  // ✅ Cập nhật đơn hàng
  async update(req, res) {
    try {
      const userRole = req.user?.role;
      const { id } = req.params;
      const { status, ...rest } = req.body || {};

      // 🛡️ Ngăn không cho người không phải khách hàng tự đặt trạng thái "completed"
      if (status === "completed" && userRole !== "customer") {
        return res.status(403).json({
          message: "Chỉ khách hàng mới được xác nhận hoàn thành đơn hàng",
        });
      }

      const updated = await OrderService.updateOrder(id, { status, ...rest });
      return res.status(200).json(updated);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  // ✅ Xóa đơn hàng
  async delete(req, res) {
    try {
      const deleted = await OrderService.deleteOrder(req.params.id);
      res.status(200).json(deleted);
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  }

  // ✅ Khách hàng xác nhận đã nhận hàng
  async confirmCompleted(req, res) {
    try {
      const userId = req.user?.id || req.user?._id;
      const { id } = req.params;

      const updated = await OrderService.confirmCompletedByCustomer(id, userId);
      return res.status(200).json({
        message: "Xác nhận hoàn thành đơn hàng thành công",
        data: updated,
      });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
}

export default new OrderController();
