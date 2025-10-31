import PaymentService from "../services/payment.services.js";

class PaymentController {
  async create(req, res) {
    try {
      const payment = await PaymentService.createPayment(req.body);
      res.status(201).json(payment);
    } catch (error) {
      res.status(400).json({ message: error.message });
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
