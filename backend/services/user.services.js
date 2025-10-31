// services/user.services.js
import UserRepository from "../repositories/user.repositories.js";
import bcrypt from "bcryptjs";

class UserService {
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

  // Lấy user theo role
  async getUsersByRole(role) {
    return await UserRepository.getUsersByRole(role);
  }

  // Cập nhật thông tin user
  async updateUser(userId, updateData) {
    // Nếu có password mới, hash lại
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    const updatedUser = await UserRepository.updateUser(userId, updateData);
    if (!updatedUser) throw new Error("User not found or update failed");
    return updatedUser;
  }

  // Xóa user
  async deleteUser(userId) {
    const deletedUser = await UserRepository.deleteUser(userId);
    if (!deletedUser) throw new Error("User not found or delete failed");
    return deletedUser;
  }
}

export default new UserService();
