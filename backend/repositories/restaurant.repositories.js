import Restaurant from "../models/restaurant.models.js";

class RestaurantRepository {
  // Tạo nhà hàng mới
  async createRestaurant(restaurantData) {
    const restaurant = new Restaurant(restaurantData);
    return await restaurant.save();
  }

  // Lấy nhà hàng theo ID
  async getRestaurantById(restaurantId) {
    return await Restaurant.findById(restaurantId)
      .populate("ownerId", "name email")
      .populate("locationId");
  }

  // Lấy tất cả nhà hàng
  async getAllRestaurants() {
    return await Restaurant.find().populate("ownerId", "name email").populate("locationId").sort({ createdAt: -1 });
  }

  // Lấy nhà hàng theo owner
  async getRestaurantsByOwner(ownerId) {
    return await Restaurant.find({ ownerId }).populate("locationId").sort({ createdAt: -1 });
  }

// Lấy nhà hàng đã xác minh (public)
  async getVerifiedRestaurants() {
    return await Restaurant.find({ status: "verified" })
      .populate("ownerId", "name email")
      .populate("locationId")
      .sort({ createdAt: -1 });
  }

  // Cập nhật nhà hàng
  async updateRestaurant(restaurantId, updateData) {
    return await Restaurant.findByIdAndUpdate(restaurantId, updateData, { new: true });
  }

  // Xóa nhà hàng
  async deleteRestaurant(restaurantId) {
    return await Restaurant.findByIdAndDelete(restaurantId);
  }
}

export default new RestaurantRepository();
