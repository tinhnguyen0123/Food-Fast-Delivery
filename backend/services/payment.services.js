import PaymentRepository from "../repositories/payment.repositories.js";
import OrderRepository from "../repositories/order.repositories.js";
// 🔹 MỚI: Import crypto và axios
import crypto from "crypto";
import axios from "axios";

class PaymentService {
  // Tạo payment mới
  async createPayment(paymentData) {
    if (
      !paymentData.orderIds ||
      !Array.isArray(paymentData.orderIds) ||
      paymentData.orderIds.length === 0 ||
      !paymentData.amount
    ) {
      throw new Error("Thiếu thông tin bắt buộc (orderIds, amount)");
    }

    // (Bỏ qua việc kiểm tra từng orderId ở đây để đơn giản,
    // vì chúng vừa được tạo ở bước trước)

    // 1. Tạo thanh toán ở trạng thái 'pending'
    const payment = await PaymentRepository.createPayment({
      orderIds: paymentData.orderIds,
      method: paymentData.method,
      amount: paymentData.amount, // 🔹 MỚI: Lưu lại số tiền
      status: "pending",
    });

    // 🔹 MỚI: Cập nhật ngược lại tất cả các Order với paymentId này
    try {
      for (const orderId of paymentData.orderIds) {
        await OrderRepository.updateOrder(orderId, { paymentId: payment._id });
      }
    } catch (e) {
      console.error("Lỗi khi cập nhật paymentId cho đơn hàng:", e.message);
      // Nếu lỗi, nên xóa payment vừa tạo để tránh rác DB
      await PaymentRepository.deletePayment(payment._id);
      throw new Error("Không thể liên kết thanh toán với đơn hàng");
    }
    

    // 2. Nếu là MOMO, gọi API MoMo để lấy link
    if (paymentData.method === "MOMO") {
      try {
        const momoResponse = await this.createMomoPaymentUrl(
          payment,
          paymentData.amount
        );

        // 3. Cập nhật transactionId từ MoMo trả về (requestId)
        await PaymentRepository.updatePayment(payment._id, {
          transactionId: momoResponse.requestId,
        });

        // 4. Trả về payment VÀ paymentUrl cho frontend
        return { ...payment.toObject(), paymentUrl: momoResponse.payUrl };
      } catch (error) {
        console.error("MoMo API error:", error.response?.data || error.message);
        // Nếu lỗi, cập nhật payment là 'failed'
        await PaymentRepository.updatePayment(payment._id, { status: "failed" });
        throw new Error("Không thể tạo link thanh toán MoMo");
      }
    }

    // 3. Nếu là COD, chỉ cần trả về payment
    return payment;
  }

  // 🔹 MỚI: Hàm tạo link thanh toán MoMo
  async createMomoPaymentUrl(payment, amount) {
    const partnerCode = process.env.MOMO_PARTNER_CODE;
    const accessKey = process.env.MOMO_ACCESS_KEY;
    const secretKey = process.env.MOMO_SECRET_KEY;
    // Lấy URL từ .env (đây là URL frontend)
    const redirectUrl = `${process.env.MOMO_REDIRECT_URL}/payment-status?paymentId=${payment._id}`;
    const ipnUrl = process.env.MOMO_IPN_URL;
    const amountStr = amount.toString();

    // Dùng _id của payment làm requestId và orderId (duy nhất)
    // MoMo yêu cầu orderId và requestId là duy nhất cho mỗi giao dịch
    const orderId = payment._id.toString() + "_" + new Date().getTime();
    const requestId = orderId;

    const orderInfo = `Thanh toán ${payment.orderIds.length} đơn hàng Drone Delivery`;
    const requestType = "payWithMethod"; // "payWithMethod" từ file của bạn cũng OK
    const extraData = JSON.stringify({ dbPaymentId: payment._id }); // Gửi ID của payment DB

    // Tạo chữ ký
    const rawSignature = `accessKey=${accessKey}&amount=${amountStr}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

    const signature = crypto
      .createHmac("sha256", secretKey)
      .update(rawSignature)
      .digest("hex");

    const requestBody = JSON.stringify({
      partnerCode,
      requestId,
      amount: amountStr,
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      requestType,
      extraData,
      lang: "vi",
      signature,
    });

    // Gọi API MoMo
    const momoEndpoint = "https://test-payment.momo.vn/v2/gateway/api/create";
    const response = await axios.post(momoEndpoint, requestBody, {
      headers: { "Content-Type": "application/json" },
    });

    if (response.data.resultCode !== 0) {
      throw new Error(response.data.message || "Tạo thanh toán MoMo thất bại");
    }

    // Trả về dữ liệu MoMo (chứa payUrl và requestId)
    return response.data;
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
    // Bỏ lỗi 'not found' để trả về mảng rỗng nếu không có
    return payments;
  }

  // Lấy payment theo trạng thái
  async getPaymentsByStatus(status) {
    const payments = await PaymentRepository.getPaymentsByStatus(status);
    return payments;
  }

  // Cập nhật trạng thái thanh toán
  async updatePayment(paymentId, updateData) {
    const updated = await PaymentRepository.updatePayment(paymentId, updateData);
    if (!updated) throw new Error("Cập nhật thanh toán thất bại");

    // 🔹 THAY ĐỔI: Nếu thanh toán thành công, cập nhật TẤT CẢ đơn hàng
    if (updateData.status === "paid") {
      try {
        // Lặp qua tất cả orderIds trong payment và cập nhật
        for (const orderId of updated.orderIds) {
          await OrderRepository.updateOrder(orderId, {
            status: "preparing", // Chuyển đơn hàng sang "Đang chuẩn bị"
            // Bạn cũng có thể cập nhật paymentMethod nếu muốn, dù order đã có paymentId
            paymentMethod: "MOMO",
          });
        }
      } catch (e) {
        console.error("Lỗi khi cập nhật trạng thái đơn hàng:", e.message);
        // (Không throw lỗi này để tránh làm hỏng IPN)
      }
    }
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