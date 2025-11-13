import DeliveryRepository from "../repositories/delivery.repositories.js";

class DeliveryService {
  async createDelivery(data) {
    if (!data.orderId || !data.droneId) {
      throw new Error("Missing required fields: orderId or droneId");
    }
    return await DeliveryRepository.createDelivery(data);
  }

  async getDeliveryById(id) {
    const delivery = await DeliveryRepository.getDeliveryById(id);
    if (!delivery) throw new Error("Delivery not found");
    return delivery;
  }

  async getDeliveriesByDrone(droneId) {
    return await DeliveryRepository.getDeliveriesByDroneId(droneId);
  }

  async getDeliveriesByOrder(orderId) {
    return await DeliveryRepository.getDeliveriesByOrderId(orderId);
  }

  async updateDelivery(id, data) {
    const updated = await DeliveryRepository.updateDelivery(id, data);
    if (!updated) throw new Error("Failed to update delivery");
    return updated;
  }

  async deleteDelivery(id) {
    const deleted = await DeliveryRepository.deleteDelivery(id);
    if (!deleted) throw new Error("Delivery not found or already deleted");
    return deleted;
  }
}

export default new DeliveryService();