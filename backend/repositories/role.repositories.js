import Role from "../models/role.models.js";

class RoleRepository {
  // Tạo role mới
  async createRole(roleData) {
    const role = new Role(roleData);
    return await role.save();
  }

  // Lấy role theo ID
  async getRoleById(roleId) {
    return await Role.findById(roleId);
  }

  // Lấy role theo tên
  async getRoleByName(name) {
    return await Role.findOne({ name });
  }

  // Lấy tất cả role
  async getAllRoles() {
    return await Role.find().sort({ createdAt: -1 });
  }

  // Cập nhật role (tên hoặc permissions)
  async updateRole(roleId, updateData) {
    return await Role.findByIdAndUpdate(roleId, updateData, { new: true });
  }

  // Xóa role
  async deleteRole(roleId) {
    return await Role.findByIdAndDelete(roleId);
  }
}

export default new RoleRepository();
