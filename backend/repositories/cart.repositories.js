import Cart from "../models/cart.models.js";

class CartRepository {
  // Tạo giỏ hàng mới cho user
  async createCart(userId) {
    const cart = new Cart({ userId, items: [], totalPrice: 0 });
    return await cart.save();
  }

  // Lấy giỏ hàng mới nhất của user
  async getLatestCartByUser(userId) {
    return await Cart.findOne({ userId })
      .populate("items.productId", "name price image")
      .sort({ createdAt: -1 });
  }

  // Lấy giỏ hàng theo ID
 async getCartById(cartId) {
    return await Cart.findById(cartId)
      .populate({
        path: "items.productId",
        select: "name price image category restaurantId",
        populate: { path: "restaurantId", select: "name status" }
      });
  }

  // Thêm sản phẩm vào giỏ hàng
  async addItem(cartId, productId, quantity) {
    const cart = await Cart.findById(cartId);
    if (!cart) throw new Error("Cart not found");

    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Nếu sản phẩm đã tồn tại
      if (quantity > 0) {
        // Cập nhật số lượng mới
        cart.items[existingItemIndex].quantity = quantity; // << SỬA Ở ĐÂY: Dùng = thay vì +=
      } else {
        // Nếu số lượng <= 0, xóa khỏi giỏ hàng
        cart.items.splice(existingItemIndex, 1);
      }
    } else if (quantity > 0) {
      // Nếu là sản phẩm mới và số lượng > 0
      cart.items.push({ productId, quantity });
    }

    return await cart.save();
  }

  // Xóa sản phẩm khỏi giỏ hàng
  async removeItem(cartId, productId) {
    const cart = await Cart.findById(cartId);
    if (!cart) throw new Error("Cart not found");

    cart.items = cart.items.filter(item => item.productId.toString() !== productId);
    return await cart.save();
  }

  // Cập nhật totalPrice (Service tính)
  async updateTotalPrice(cartId, totalPrice) {
    return await Cart.findByIdAndUpdate(cartId, { totalPrice }, { new: true });
  }

  // Xóa giỏ hàng
  async deleteCart(cartId) {
    return await Cart.findByIdAndDelete(cartId);
  }
}

export default new CartRepository();
