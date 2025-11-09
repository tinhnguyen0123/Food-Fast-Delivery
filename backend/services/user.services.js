import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import UserRepository from "../repositories/user.repositories.js";
import RestaurantRepository from "../repositories/restaurant.repositories.js";
import ProductRepository from "../repositories/product.repositories.js";
import OrderRepository from "../repositories/order.repositories.js";
import DroneRepository from "../repositories/drone.repositories.js";
import { deleteFromCloudinary } from "../utils/cloudinary.js";

class UserService {
  // Đăng ký user mới
  async registerUser({ name, email, password, phone, role }) {
    const existingUser = await UserRepository.getUserByEmail(email);
    if (existingUser) throw new Error("Email already exists");

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await UserRepository.createUser({
      name,
      email,
      password: hashedPassword,
      phone,
      role,
      status: role === "restaurant" ? "pending" : "active",
    });

    return newUser;
  }

  // Đăng nhập
  async loginUser({ email, password }) {
    const user = await UserRepository.getUserByEmail(email);
    if (!user) throw new Error("Invalid email or password");
    
    // ✅ Kiểm tra trạng thái tài khoản
    if (user.status === "suspended") throw new Error("Tài khoản đã bị khóa");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid email or password");

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return { user, token };
  }

  // Lấy tất cả user
  async getAllUsers() {
    return await UserRepository.getAllUsers();
  }

  // Lấy user theo ID
  async getUserById(userId) {
    const user = await UserRepository.getUserById(userId);
    if (!user) throw new Error("User not found");
    return user;
  }

  // Cập nhật user
  async updateUser(userId, updateData) {
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    const updatedUser = await UserRepository.updateUser(userId, updateData);
    if (!updatedUser) throw new Error("User not found or update failed");
    return updatedUser;
  }

  // ✅ Xóa user (admin) + cascade nếu là nhà hàng
  async deleteUser(userId) {
    const user = await UserRepository.getUserById(userId);
    if (!user) throw new Error("User không tồn tại");

    const result = {
      userDeleted: false,
      restaurantsDeleted: 0,
      productsDeleted: 0,
      dronesDeleted: 0,
      ordersDeleted: 0,
      restaurantIds: [],
    };

    // Nếu là chủ nhà hàng → cascade
    if (user.role === "restaurant") {
      const restaurants = await RestaurantRepository.getRestaurantsByOwner(userId);

      for (const r of restaurants) {
        result.restaurantIds.push(r._id.toString());

        // Xóa products
        const products = await ProductRepository.getProductsByRestaurant(r._id);
        for (const p of products) {
          if (p.imagePublicId) {
            await deleteFromCloudinary(p.imagePublicId).catch(() => {});
          }
          await ProductRepository.deleteProduct(p._id);
          result.productsDeleted++;
        }

        // Xóa drones
        const drones = await DroneRepository.getDronesByRestaurant(r._id);
        for (const d of drones) {
          await DroneRepository.deleteDrone(d._id);
          result.dronesDeleted++;
        }

        // Xóa orders
        const orders = await OrderRepository.getOrdersByRestaurant(r._id);
        for (const o of orders) {
          await OrderRepository.deleteOrder(o._id);
          result.ordersDeleted++;
        }

        // Xóa restaurant (ảnh nếu có)
        if (r.imagePublicId) {
          await deleteFromCloudinary(r.imagePublicId).catch(() => {});
        }
        await RestaurantRepository.deleteRestaurant(r._id);
        result.restaurantsDeleted++;
      }
    }

    // Xóa user
    await UserRepository.deleteUser(userId);
    result.userDeleted = true;

    return result;
  }
}

export default new UserService();
