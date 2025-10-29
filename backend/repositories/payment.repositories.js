import Payment from "../models/payment.models.js";

class PaymentRepository {
  // Tạo payment mới
  async createPayment(paymentData) {
    const payment = new Payment(paymentData);
    return await payment.save();
  }

  // Lấy payment theo ID
  async getPaymentById(paymentId) {
    return await Payment.findById(paymentId)
      .populate("orderId");
  }

  // Lấy tất cả payment của 1 order
  async getPaymentsByOrder(orderId) {
    return await Payment.find({ orderId }).sort({ createdAt: -1 });
  }

  // Lấy payment theo trạng thái (pending, paid, failed)
  async getPaymentsByStatus(status) {
    return await Payment.find({ status }).sort({ createdAt: -1 });
  }

  // Cập nhật payment (thường dùng để đổi status khi thanh toán)
  async updatePayment(paymentId, updateData) {
    return await Payment.findByIdAndUpdate(paymentId, updateData, { new: true });
  }

  // Xóa payment
  async deletePayment(paymentId) {
    return await Payment.findByIdAndDelete(paymentId);
  }
}

export default new PaymentRepository();
