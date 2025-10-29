import UserRepository from "../repositories/user.repositories.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

class AuthService {
  // Đăng ký user mới
  async register(userData) {
    // Kiểm tra email đã tồn tại chưa
    const existingUser = await UserRepository.getUserByEmail(userData.email);
    if (existingUser) throw new Error("Email already registered");

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    userData.password = hashedPassword;

    // Tạo user
    const user = await UserRepository.createUser(userData);
    return user;
  }

  // Đăng nhập
  async login(email, password) {
    const user = await UserRepository.getUserByEmail(email);
    if (!user) throw new Error("User not found");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid password");

    // Tạo token JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return { user, token };
  }

  // Thay đổi mật khẩu
  async changePassword(userId, oldPassword, newPassword) {
    const user = await UserRepository.getUserById(userId);
    if (!user) throw new Error("User not found");

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) throw new Error("Old password incorrect");

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    return await UserRepository.updateUser(userId, { password: hashedPassword });
  }
}

export default new AuthService();
