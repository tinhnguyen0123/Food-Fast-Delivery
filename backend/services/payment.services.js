import PaymentRepository from "../repositories/payment.repositories.js";
import OrderRepository from "../repositories/order.repositories.js";

class PaymentService {
  // Tạo payment mới
  async createPayment(paymentData) {
    if (!paymentData.orderId || !paymentData.amount) {
      throw new Error("Thiếu thông tin bắt buộc (orderId, amount)");
    }

    const order = await OrderRepository.getOrderById(paymentData.orderId);
    if (!order) throw new Error("Đơn hàng không tồn tại");

    const payment = await PaymentRepository.createPayment(paymentData);
    return payment;
  }

  // Lấy payment theo ID
  async getPaymentById(paymentId) {
    const payment = await PaymentRepository.getPaymentById(paymentId);
    if (!payment) throw new Error("Không tìm thấy thông tin thanh toán");
    return payment;
  }

  // Lấy tất cả payment của 1 đơn hàng
  async getPaymentsByOrder(orderId) {
    const payments = await PaymentRepository.getPaymentsByOrder(orderId);
    if (!payments.length) throw new Error("Chưa có giao dịch thanh toán nào");
    return payments;
  }

  // Lấy payment theo trạng thái
  async getPaymentsByStatus(status) {
    const payments = await PaymentRepository.getPaymentsByStatus(status);
    if (!payments.length) throw new Error("Không có giao dịch nào với trạng thái này");
    return payments;
  }

  // Cập nhật trạng thái thanh toán
  async updatePayment(paymentId, updateData) {
    const updated = await PaymentRepository.updatePayment(paymentId, updateData);
    if (!updated) throw new Error("Cập nhật thanh toán thất bại");
    return updated;
  }

  // Xóa payment
  async deletePayment(paymentId) {
    const deleted = await PaymentRepository.deletePayment(paymentId);
    if (!deleted) throw new Error("Không thể xóa giao dịch này");
    return deleted;
  }
}

export default new PaymentService();
