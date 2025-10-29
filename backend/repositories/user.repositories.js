import User from "../models/user.models.js";

class UserRepository {
  // Tạo user mới
  async createUser(userData) {
    const user = new User(userData);
    return await user.save();
  }

  // Lấy user theo ID
  async getUserById(userId) {
    return await User.findById(userId);
  }

  // Lấy user theo email (dùng cho đăng nhập/kiểm tra email)
  async getUserByEmail(email) {
    return await User.findOne({ email });
  }

  // Lấy tất cả user (có thể dùng để admin quản lý)
  async getAllUsers() {
    return await User.find().sort({ createdAt: -1 });
  }

  // Lấy tất cả user theo role (admin, customer, restaurant)
  async getUsersByRole(role) {
    return await User.find({ role }).sort({ createdAt: -1 });
  }

  // Cập nhật thông tin user
  async updateUser(userId, updateData) {
    return await User.findByIdAndUpdate(userId, updateData, { new: true });
  }

  // Xóa user
  async deleteUser(userId) {
    return await User.findByIdAndDelete(userId);
  }
}

export default new UserRepository();
