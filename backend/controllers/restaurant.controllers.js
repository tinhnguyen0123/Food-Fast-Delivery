import RestaurantService from "../services/restaurant.services.js";

class RestaurantController {
  // 🟢 Tạo nhà hàng mới (có upload ảnh)
  async create(req, res) {
    try {
      const restaurant = await RestaurantService.createRestaurant(req.body, req.file);
      res.status(201).json({
        message: "Tạo nhà hàng thành công",
        data: restaurant,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // 🟢 Lấy nhà hàng theo ID
  async getById(req, res) {
    try {
      const restaurant = await RestaurantService.getRestaurantById(req.params.id);
      res.status(200).json(restaurant);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  // 🟢 Lấy tất cả nhà hàng
  async getAll(req, res) {
    try {
      const restaurants = await RestaurantService.getAllRestaurants();
      res.status(200).json(restaurants);
    } catch (error) {
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  }

  // 🟢 Lấy nhà hàng theo chủ sở hữu
  async getByOwner(req, res) {
    try {
      const ownerId = req.params.ownerId;
      const restaurants = await RestaurantService.getRestaurantsByOwner(ownerId);
      res.status(200).json(restaurants);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // 🟢 Cập nhật nhà hàng (có thể cập nhật ảnh)
  async update(req, res) {
    try {
      const updated = await RestaurantService.updateRestaurant(req.params.id, req.body, req.file);
      res.status(200).json({
        message: "Cập nhật nhà hàng thành công",
        data: updated,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // 🟢 Cập nhật trạng thái nhà hàng
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body; // "verified" | "suspended" | "pending"
      const updated = await RestaurantService.updateRestaurant(id, { status });
      if (!updated) return res.status(404).json({ message: "Không tìm thấy nhà hàng" });
      return res.status(200).json({ message: "Cập nhật trạng thái thành công", data: updated });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  // 🔒 Khóa nhà hàng
  async lock(req, res) {
    try {
      const updated = await RestaurantService.updateRestaurant(req.params.id, { status: "suspended" });
      if (!updated) return res.status(404).json({ message: "Không tìm thấy nhà hàng" });
      res.status(200).json({ message: "Đã khóa nhà hàng", data: updated });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  }

  // 🔓 Mở khóa nhà hàng
  async unlock(req, res) {
    try {
      const updated = await RestaurantService.updateRestaurant(req.params.id, { status: "verified" });
      if (!updated) return res.status(404).json({ message: "Không tìm thấy nhà hàng" });
      res.status(200).json({ message: "Đã mở khóa nhà hàng", data: updated });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  }

  // ✅ Xóa nhà hàng + cascade
  async delete(req, res) {
    try {
      const report = await RestaurantService.deleteRestaurant(req.params.id);
      res.status(200).json({
        message: "Đã xóa nhà hàng",
        report,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

export default new RestaurantController();
