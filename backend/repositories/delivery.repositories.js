import Delivery from "../models/delivery.models.js";

class DeliveryRepository {
  // Tạo delivery mới
  async createDelivery(deliveryData) {
    const delivery = new Delivery(deliveryData);
    return await delivery.save();
  }

  // Lấy delivery theo ID
  async getDeliveryById(deliveryId) {
    return await Delivery.findById(deliveryId)
      .populate("orderId")
      .populate("droneId")
      .populate("pickupLocationId")
      .populate("dropoffLocationId");
  }

  // Lấy tất cả delivery theo drone
  async getDeliveriesByDroneId(droneId) {
    return await Delivery.find({ droneId }).populate("orderId").sort({ createdAt: -1 });
  }

  // Lấy tất cả delivery theo order
  async getDeliveriesByOrderId(orderId) {
    return await Delivery.find({ orderId }).populate("droneId").sort({ createdAt: -1 });
  }

  // Cập nhật delivery
  async updateDelivery(deliveryId, updateData) {
    return await Delivery.findByIdAndUpdate(deliveryId, updateData, { new: true });
  }

  // Xóa delivery
  async deleteDelivery(deliveryId) {
    return await Delivery.findByIdAndDelete(deliveryId);
  }
}

export default new DeliveryRepository();
