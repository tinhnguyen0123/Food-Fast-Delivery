import LocationRepository from "../repositories/location.repositories.js";

class LocationService {
  // Tạo location mới
  async createLocation(data) {
    if (!data.name || !data.type) {
      throw new Error("Thiếu thông tin bắt buộc: name hoặc type");
    }
    return await LocationRepository.createLocation(data);
  }

  // Lấy location theo ID
  async getLocationById(id) {
    const location = await LocationRepository.getLocationById(id);
    if (!location) throw new Error("Không tìm thấy địa điểm");
    return location;
  }

  // Lấy tất cả location
  async getAllLocations() {
    return await LocationRepository.getAllLocations();
  }

  // Lấy location theo loại (pickup, dropoff, warehouse, v.v.)
  async getLocationsByType(type) {
    return await LocationRepository.getLocationsByType(type);
  }

  // Cập nhật location
  async updateLocation(id, data) {
    const updated = await LocationRepository.updateLocation(id, data);
    if (!updated) throw new Error("Cập nhật thất bại hoặc location không tồn tại");
    return updated;
  }

  // Xóa location
  async deleteLocation(id) {
    const deleted = await LocationRepository.deleteLocation(id);
    if (!deleted) throw new Error("Không thể xóa, location không tồn tại");
    return deleted;
  }
}

export default new LocationService();
