import RestaurantRepository from "../repositories/restaurant.repositories.js";
import ProductRepository from "../repositories/product.repositories.js";
import OrderRepository from "../repositories/order.repositories.js";
import DroneRepository from "../repositories/drone.repositories.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

class RestaurantService {
  // 🟢 Tạo nhà hàng mới
  async createRestaurant(data, file) {
    if (!data.name || !data.ownerId) {
      throw new Error("Tên nhà hàng và ID chủ sở hữu là bắt buộc");
    }

    if (file) {
      const { url, public_id } = await uploadToCloudinary(file.path, "restaurants");
      data.image = url;
      data.imagePublicId = public_id;
    }

    data.status = data.status || "pending";
    const restaurant = await RestaurantRepository.createRestaurant(data);
    return restaurant;
  }

  // 🟢 Lấy nhà hàng theo ID
  async getRestaurantById(restaurantId) {
    const restaurant = await RestaurantRepository.getRestaurantById(restaurantId);
    if (!restaurant) throw new Error("Không tìm thấy nhà hàng");
    return restaurant;
  }

  // 🟢 Lấy tất cả nhà hàng
  async getAllRestaurants() {
    return await RestaurantRepository.getAllRestaurants();
  }

  // 🟢 Lấy nhà hàng public (chỉ verified)
  async getVerifiedRestaurants() {
    return await RestaurantRepository.getVerifiedRestaurants();
  }

  // 🟢 Lấy theo chủ sở hữu
  async getRestaurantsByOwner(ownerId) {
    return await RestaurantRepository.getRestaurantsByOwner(ownerId);
  }

  // 🟢 Cập nhật nhà hàng (có thể thay ảnh)
  async updateRestaurant(restaurantId, data, file) {
    const current = await RestaurantRepository.getRestaurantById(restaurantId);
    if (!current) throw new Error("Cập nhật thất bại hoặc nhà hàng không tồn tại");

    if (file) {
      // Xóa ảnh cũ nếu có
      if (current.imagePublicId) {
        await deleteFromCloudinary(current.imagePublicId).catch(() => {});
      }
      const { url, public_id } = await uploadToCloudinary(file.path, "restaurants");
      data.image = url;
      data.imagePublicId = public_id;
    }

    const updated = await RestaurantRepository.updateRestaurant(restaurantId, data);
    return updated;
  }

  // 🟢 Cập nhật trạng thái
  async updateStatus(restaurantId, status) {
    const updated = await RestaurantRepository.updateRestaurant(restaurantId, { status });
    if (!updated) throw new Error("Không tìm thấy nhà hàng");
    return updated;
  }

  // 🔒 Khóa nhà hàng
  async lock(restaurantId) {
    return this.updateStatus(restaurantId, "suspended");
  }

  // 🔓 Mở khóa nhà hàng
  async unlock(restaurantId) {
    return this.updateStatus(restaurantId, "verified");
  }

  // ✅ Xóa nhà hàng + cascade (products, drones, orders)
  async deleteRestaurant(restaurantId) {
    const restaurant = await RestaurantRepository.getRestaurantById(restaurantId);
    if (!restaurant) throw new Error("Nhà hàng không tồn tại");

    const report = {
      restaurantDeleted: false,
      productsDeleted: 0,
      dronesDeleted: 0,
      ordersDeleted: 0,
    };

    // Xóa products
    const products = await ProductRepository.getProductsByRestaurant(restaurantId);
    for (const p of products) {
      if (p.imagePublicId) {
        await deleteFromCloudinary(p.imagePublicId).catch(() => {});
      }
      await ProductRepository.deleteProduct(p._id);
      report.productsDeleted++;
    }

    // Xóa drones
    const drones = await DroneRepository.getDronesByRestaurant(restaurantId);
    for (const d of drones) {
      await DroneRepository.deleteDrone(d._id);
      report.dronesDeleted++;
    }

    // Xóa orders
    const orders = await OrderRepository.getOrdersByRestaurant(restaurantId);
    for (const o of orders) {
      await OrderRepository.deleteOrder(o._id);
      report.ordersDeleted++;
    }

    // Xóa ảnh nhà hàng
    if (restaurant.imagePublicId) {
      await deleteFromCloudinary(restaurant.imagePublicId).catch(() => {});
    }

    // Xóa restaurant
    await RestaurantRepository.deleteRestaurant(restaurantId);
    report.restaurantDeleted = true;

    return report;
  }
}

export default new RestaurantService();
