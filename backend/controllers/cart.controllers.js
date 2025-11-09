import CartService from "../services/cart.services.js";
import Cart from "../models/cart.models.js"; // ✅ Thêm dòng này

class CartController {
  async createCart(req, res) {
    try {
      const cart = await CartService.createCart(req.user.id);
      res.status(201).json(cart);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // 🔹 Lấy giỏ hàng mới nhất của user (loại bỏ món của nhà hàng chưa verified)
  async getLatestCart(req, res) {
    try {
      const userId = req.user.id;
      let cart = await Cart.findOne({ userId })
        .populate({
          path: "items.productId",
          select: "name price image category restaurantId",
          populate: {
            path: "restaurantId",
            select: "name address phone image status"
          }
        })
        .sort({ createdAt: -1 });

      if (!cart) {
        return res.status(404).json({ message: "Không có giỏ hàng" });
      }

      // 🔍 Loại bỏ món của nhà hàng bị khóa / chưa verified
      const originalCount = cart.items.length;
      const removed = [];
      cart.items = cart.items.filter((it) => {
        const status = it.productId?.restaurantId?.status;
        if (status !== "verified") {
          removed.push(it.productId?.name || "Món");
          return false;
        }
        return true;
      });

      if (removed.length > 0) {
        // Tính lại totalPrice
        cart.totalPrice = cart.items.reduce(
          (sum, it) =>
            sum +
            Number(it.productId?.price || it.priceAtOrderTime || 0) *
              Number(it.quantity || 0),
          0
        );
        await cart.save();

        // Re-populate sau save
        cart = await Cart.findById(cart._id).populate({
          path: "items.productId",
          select: "name price image category restaurantId",
          populate: { path: "restaurantId", select: "name status" }
        });
      }

      res.status(200).json({
        ...cart.toObject(),
        _removedItems: removed, // danh sách món bị loại bỏ
        _sanitized: removed.length > 0,
        _originalItemCount: originalCount
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async addItem(req, res) {
    try {
      const { cartId, productId, quantity } = req.body;
      const updatedCart = await CartService.addItem(cartId, productId, quantity);
      res.status(200).json(updatedCart);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async removeItem(req, res) {
    try {
      const { cartId, productId } = req.body;
      const updatedCart = await CartService.removeItem(cartId, productId);
      res.status(200).json(updatedCart);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const cart = await CartService.getCartById(req.params.id);
      res.status(200).json(cart);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  async deleteCart(req, res) {
    try {
      const deleted = await CartService.deleteCart(req.params.id);
      res.status(200).json(deleted);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

export default new CartController();
