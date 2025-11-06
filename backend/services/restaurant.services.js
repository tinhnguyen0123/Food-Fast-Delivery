import RestaurantRepository from "../repositories/restaurant.repositories.js";
import cloudinary from "../utils/cloudinary.js";

class RestaurantService {
  // 🟢 Tạo nhà hàng mới
  async createRestaurant(data, file) {
    if (!data.name || !data.ownerId) {
      throw new Error("Tên nhà hàng và ID chủ sở hữu là bắt buộc");
    }

    // Nếu có file ảnh thì upload lên Cloudinary
    if (file) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "restaurants",
      });
      // ✅ LƯU ĐÚNG FIELD TRONG SCHEMA
      data.image = result.secure_url;
    }

    const restaurant = await RestaurantRepository.createRestaurant(data);
    return restaurant;
  }

  // 🟢 Lấy nhà hàng theo ID
  async getRestaurantById(restaurantId) {
    const restaurant = await RestaurantRepository.getRestaurantById(restaurantId);
    if (!restaurant) {
      throw new Error("Không tìm thấy nhà hàng");
    }
    return restaurant;
  }

  // 🟢 Lấy tất cả nhà hàng
  async getAllRestaurants() {
    return await RestaurantRepository.getAllRestaurants();
  }

  // 🟢 Lấy nhà hàng theo chủ sở hữu
  async getRestaurantsByOwner(ownerId) {
    return await RestaurantRepository.getRestaurantsByOwner(ownerId);
  }

  // 🟢 Cập nhật thông tin nhà hàng (có thể thay ảnh)
  async updateRestaurant(restaurantId, data, file) {
    if (file) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "restaurants",
      });
      // ✅ LƯU ĐÚNG FIELD TRONG SCHEMA
      data.image = result.secure_url;
    }

    const updated = await RestaurantRepository.updateRestaurant(restaurantId, data);
    if (!updated) {
      throw new Error("Cập nhật thất bại hoặc nhà hàng không tồn tại");
    }
    return updated;
  }

  // 🟢 Xóa nhà hàng
  async deleteRestaurant(restaurantId) {
    const deleted = await RestaurantRepository.deleteRestaurant(restaurantId);
    if (!deleted) {
      throw new Error("Không thể xóa, nhà hàng không tồn tại");
    }
    return deleted;
  }
}

export default new RestaurantService();
