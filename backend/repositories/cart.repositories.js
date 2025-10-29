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
      .populate("items.productId", "name price")
      .sort({ createdAt: -1 });
  }

  // Lấy giỏ hàng theo ID
  async getCartById(cartId) {
    return await Cart.findById(cartId)
      .populate("items.productId", "name price");
  }

  // Thêm sản phẩm vào giỏ hàng
  async addItem(cartId, productId, quantity) {
    const cart = await Cart.findById(cartId);
    if (!cart) throw new Error("Cart not found");

    const existingItem = cart.items.find(item => item.productId.toString() === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
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
