import RoleRepository from "../repositories/role.repositories.js";

class RoleService {
  async createRole(data) {
    const existing = await RoleRepository.getRoleByName(data.name);
    if (existing) throw new Error("Role name already exists");
    return await RoleRepository.createRole(data);
  }

  async getAllRoles() {
    return await RoleRepository.getAllRoles();
  }

  async getRoleById(id) {
    const role = await RoleRepository.getRoleById(id);
    if (!role) throw new Error("Role not found");
    return role;
  }

  async updateRole(id, data) {
    const updated = await RoleRepository.updateRole(id, data);
    if (!updated) throw new Error("Failed to update role");
    return updated;
  }

  async deleteRole(id) {
    const deleted = await RoleRepository.deleteRole(id);
    if (!deleted) throw new Error("Failed to delete role");
    return deleted;
  }
}

export default new RoleService();
