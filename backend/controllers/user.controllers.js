import UserService from "../services/user.services.js";

class UserController {
  // 🔹 Đăng ký user mới
  async registerUser(req, res) {
    try {
      const { name, email, password, phone, role } = req.body;
      const newUser = await UserService.registerUser({ name, email, password, phone, role });

      res.status(201).json({
        message: "Đăng ký thành công",
        userId: newUser._id,
        name: newUser.name,
        phone: newUser.phone,
        email: newUser.email,
        role: newUser.role,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // 🔹 Đăng nhập
  async loginUser(req, res) {
    try {
      const { email, password } = req.body;
      const { user, token } = await UserService.loginUser({ email, password });

      res.status(200).json({
        message: "Đăng nhập thành công",
        token,
        user: {
          id: user._id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // 🔹 Lấy tất cả user
  async getAllUsers(req, res) {
    try {
      const users = await UserService.getAllUsers();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // 🔹 Lấy user theo ID
  async getUserById(req, res) {
    try {
      const user = await UserService.getUserById(req.params.id);
      if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });
      res.status(200).json(user);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // 🔹 Lấy user theo role
  async getUsersByRole(req, res) {
    try {
      const { role } = req.params;
      const users = await UserService.getUsersByRole(role);
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // 🔹 Cập nhật user
  async updateUser(req, res) {
    try {
      const updatedUser = await UserService.updateUser(req.params.id, req.body);
      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // 🔹 Xóa user
  async deleteUser(req, res) {
    try {
      const deletedUser = await UserService.deleteUser(req.params.id);
      res.status(200).json({ message: "User deleted successfully", deletedUser });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // 🔹 Lấy user hiện tại từ token
  async getCurrentUser(req, res) {
    try {
      // req.user.id được gán từ middleware auth
      const user = await UserService.getUserById(req.user.id);
      if (!user) return res.status(404).json({ message: "User not found" });
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

export default new UserController();

