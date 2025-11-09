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
          status: user.status, // thêm status vào payload nếu cần
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

  // 🔹 Cập nhật trạng thái user
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body; // "active" | "pending" | "suspended"
      const updated = await UserService.updateUser(id, { status });
      if (!updated) return res.status(404).json({ message: "Không tìm thấy user" });
      res.status(200).json({ message: "Cập nhật trạng thái thành công", user: updated });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // ✅ Xóa user + cascade nếu là nhà hàng
  async deleteUser(req, res) {
    try {
      const report = await UserService.deleteUser(req.params.id);
      res.status(200).json({
        message: "Đã xóa user",
        report,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // 🔹 Lấy user hiện tại từ token
  async getCurrentUser(req, res) {
    try {
      const user = await UserService.getUserById(req.user.id);
      if (!user) return res.status(404).json({ message: "User not found" });
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // 🔹 Khóa tài khoản user
  async lockUser(req, res) {
    try {
      const updated = await UserService.updateUser(req.params.id, { status: "suspended" });
      if (!updated) return res.status(404).json({ message: "Không tìm thấy user" });
      res.status(200).json({ message: "Đã khóa tài khoản", user: updated });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  }

  // 🔹 Mở khóa tài khoản user
  async unlockUser(req, res) {
    try {
      const updated = await UserService.updateUser(req.params.id, { status: "active" });
      if (!updated) return res.status(404).json({ message: "Không tìm thấy user" });
      res.status(200).json({ message: "Đã mở khóa tài khoản", user: updated });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  }
}

export default new UserController();
