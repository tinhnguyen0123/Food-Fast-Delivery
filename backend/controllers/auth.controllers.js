import AuthService from "../services/auth.services.js";

class AuthController {
  async register(req, res) {
    try {
      const user = await AuthService.register(req.body);
      return res.status(201).json({
        message: "User registered successfully",
        user: { id: user._id, email: user.email, role: user.role },
      });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const { user, token } = await AuthService.login(email, password);
      res.cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000, // 1 ngày
      });
      return res.status(200).json({
        message: "Login successful",
        user: { id: user._id, email: user.email, role: user.role },
      });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async changePassword(req, res) {
    try {
      const { userId } = req.user; // Lấy từ middleware verify token
      const { oldPassword, newPassword } = req.body;
      const updatedUser = await AuthService.changePassword(
        userId,
        oldPassword,
        newPassword
      );
      return res
        .status(200)
        .json({ message: "Password changed successfully", updatedUser });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async logout(req, res) {
    try {
      res.clearCookie("token");
      return res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}

export default new AuthController();
