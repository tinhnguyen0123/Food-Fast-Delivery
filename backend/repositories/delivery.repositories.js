import Delivery from "../models/delivery.models.js";

class DeliveryRepository {
  // 🔹 Tạo delivery mới
  async createDelivery(deliveryData) {
    const delivery = new Delivery(deliveryData);
    return await delivery.save();
  }

  // 🔹 Lấy delivery theo ID
  async getDeliveryById(deliveryId) {
    return await Delivery.findById(deliveryId)
      .populate("orderId")
      .populate({
        path: "droneId",
        populate: { path: "currentLocationId" }, // ✅ nested populate để lấy tọa độ
      })
      .populate("pickupLocationId")
      .populate("dropoffLocationId");
  }

  // 🔹 Lấy tất cả delivery theo drone
  async getDeliveriesByDroneId(droneId) {
    return await Delivery.find({ droneId })
      .populate("orderId")
      .populate({
        path: "droneId",
        populate: { path: "currentLocationId" }, // ✅ nested populate để lấy tọa độ
      })
      .populate("pickupLocationId")
      .populate("dropoffLocationId")
      .sort({ createdAt: -1 });
  }

  // 🔹 Lấy delivery theo order (chỉ bản ghi mới nhất)
  async getDeliveryByOrderId(orderId) {
    return await Delivery.findOne({ orderId })
      .populate({
        path: "droneId",
        populate: { path: "currentLocationId" }, // ✅ nested populate để lấy tọa độ
      })
      .populate("pickupLocationId")
      .populate("dropoffLocationId")
      .lean(); // ✅ Trả về plain JS object, giúp nhẹ hơn khi chỉ cần đọc dữ liệu
  }

  // 🔹 Cập nhật delivery
  async updateDelivery(deliveryId, updateData) {
    return await Delivery.findByIdAndUpdate(deliveryId, updateData, { new: true });
  }

  // 🔹 Xóa delivery
  async deleteDelivery(deliveryId) {
    return await Delivery.findByIdAndDelete(deliveryId);
  }
}

export default new DeliveryRepository();