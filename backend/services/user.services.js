import UserRepository from "../repositories/user.repositories.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

class UserService {
  // Đăng ký user mới
  async registerUser({ name, email, password, phone , role }) {
    const existingUser = await UserRepository.getUserByEmail(email);
    if (existingUser) throw new Error("Email already exists");

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await UserRepository.createUser({
      name,
      email,
      password: hashedPassword,
      phone,
      role,
    });

    return newUser;
  }

  // Đăng nhập
  async loginUser({ email, password }) {
    const user = await UserRepository.getUserByEmail(email);
    if (!user) throw new Error("Invalid email or password");

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

  // Xóa user
  async deleteUser(userId) {
    const deletedUser = await UserRepository.deleteUser(userId);
    if (!deletedUser) throw new Error("User not found or delete failed");
    return deletedUser;
  }
}

export default new UserService();

