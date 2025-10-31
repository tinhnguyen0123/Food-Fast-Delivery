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

  // 🟢 Xóa nhà hàng
  async delete(req, res) {
    try {
      const deleted = await RestaurantService.deleteRestaurant(req.params.id);
      res.status(200).json({
        message: "Xóa nhà hàng thành công",
        data: deleted,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

export default new RestaurantController();
