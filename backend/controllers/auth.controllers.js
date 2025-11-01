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

      // Gửi cookie
      res.cookie("token", token, {
        httpOnly: true,
        sameSite: "Strict",
        maxAge: 24 * 60 * 60 * 1000, // 1 ngày
      });

      return res.status(200).json({
        message: "Login successful",
        user: { id: user._id, email: user.email, role: user.role },
        token, // gửi token luôn trong JSON để frontend test dễ
      });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async changePassword(req, res) {
    try {
      const { oldPassword, newPassword } = req.body;
      const userId = req.user.id;

      const updatedUser = await AuthService.changePassword(userId, oldPassword, newPassword);
      return res.status(200).json({
        message: "Password changed successfully",
        user: { id: updatedUser._id, email: updatedUser.email, role: updatedUser.role },
      });
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
