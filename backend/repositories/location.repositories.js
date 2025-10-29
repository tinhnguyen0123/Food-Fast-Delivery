import Location from "../models/location.models.js";

class LocationRepository {
  // Tạo location mới
  async createLocation(locationData) {
    const location = new Location(locationData);
    return await location.save();
  }

  // Lấy location theo ID
  async getLocationById(locationId) {
    return await Location.findById(locationId);
  }

  // Lấy tất cả location
  async getAllLocations() {
    return await Location.find().sort({ createdAt: -1 });
  }

  // Lấy location theo type
  async getLocationsByType(type) {
    return await Location.find({ type }).sort({ createdAt: -1 });
  }

  // Cập nhật location
  async updateLocation(locationId, updateData) {
    return await Location.findByIdAndUpdate(locationId, updateData, { new: true });
  }

  // Xóa location
  async deleteLocation(locationId) {
    return await Location.findByIdAndDelete(locationId);
  }
}

export default new LocationRepository();
