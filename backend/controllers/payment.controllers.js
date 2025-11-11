import PaymentService from "../services/payment.services.js";

class PaymentController {
  async create(req, res) {
    try {
      // 🔹 THAY ĐỔI: Dữ liệu gửi đi bao gồm cả 'amount'
      const paymentData = {
        ...req.body,
        userId: req.user.id, // Lấy từ verifyToken
      };
      const payment = await PaymentService.createPayment(paymentData);
      res.status(201).json(payment);
    } catch (error) {
      console.error("Create Payment Error:", error.message);
      res.status(400).json({ message: error.message });
    }
  }

  // 🔹 MỚI: Hàm xử lý IPN (thông báo ngầm) từ MoMo
  async handleMomoIPN(req, res) {
    console.log("--- MoMo IPN Received ---");
    console.log(req.body);

    const {
      resultCode,
      message,
      extraData,
      // ... các trường khác
    } = req.body;

    // TODO: Xác thực chữ ký từ MoMo (Rất quan trọng cho Production)
    // Tạm thời trong môi trường test, chúng ta tin tưởng resultCode

    try {
      let dbPaymentId;
      try {
        // Lấy dbPaymentId chúng ta đã gửi đi
        const extraDataParsed = JSON.parse(extraData);
        dbPaymentId = extraDataParsed.dbPaymentId;
      } catch (e) {
        console.error("IPN: Không thể parse extraData", extraData);
        // Phản hồi MoMo là lỗi, MoMo sẽ thử lại
        return res.status(400).json({ message: "Invalid extraData" });
      }

      if (!dbPaymentId) {
        return res.status(400).json({ message: "Missing paymentId in extraData" });
      }

      // Tìm payment trong DB
      const payment = await PaymentService.getPaymentById(dbPaymentId);
      if (!payment) {
        console.error("IPN: Không tìm thấy payment với ID:", dbPaymentId);
        return res.status(404).json({ message: "Payment not found" });
      }

      // Chỉ cập nhật nếu đang 'pending'
      if (payment.status === "pending") {
        if (resultCode === 0) {
          // 0 = Thành công
          console.log(`IPN: Cập nhật payment ${dbPaymentId} -> PAID`);
          await PaymentService.updatePayment(dbPaymentId, { status: "paid" });
        } else {
          // Thất bại
          console.log(`IPN: Cập nhật payment ${dbPaymentId} -> FAILED`);
          await PaymentService.updatePayment(dbPaymentId, { status: "failed" });
        }
      }

      // Phản hồi MoMo (status 204 - No Content)
      res.status(204).send();
    } catch (error) {
      console.error("IPN Handling Error:", error.message);
      // Phản hồi MoMo là có lỗi
      res.status(500).json({ message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const payment = await PaymentService.getPaymentById(req.params.id);
      res.status(200).json(payment);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  async getByOrder(req, res) {
    try {
      const payments = await PaymentService.getPaymentsByOrder(req.params.orderId);
      res.status(200).json(payments);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  async getByStatus(req, res) {
    try {
      const payments = await PaymentService.getPaymentsByStatus(req.params.status);
      res.status(200).json(payments);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  async update(req, res) {
    try {
      const updated = await PaymentService.updatePayment(req.params.id, req.body);
      res.status(200).json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const deleted = await PaymentService.deletePayment(req.params.id);
      res.status(200).json(deleted);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

export default new PaymentController();
