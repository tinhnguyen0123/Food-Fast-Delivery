import CartRepository from "../repositories/cart.repositories.js";
import Product from "../models/product.models.js";

class CartService {
  // Tạo giỏ hàng mới cho user
  async createCart(userId) {
    return await CartRepository.createCart(userId);
  }

  // Lấy giỏ hàng mới nhất của user
  async getLatestCartByUser(userId) {
    const cart = await CartRepository.getLatestCartByUser(userId);
    if (!cart) throw new Error("Không tìm thấy giỏ hàng");
    return cart;
  }

  // Thêm sản phẩm vào giỏ hàng
  async addItem(cartId, productId, quantity) {
    const product = await Product.findById(productId);
    if (!product) throw new Error("Sản phẩm không tồn tại");

    const cart = await CartRepository.addItem(cartId, productId, quantity);
    const totalPrice = cart.items.reduce(async (sumPromise, item) => {
      const sum = await sumPromise;
      const prod = await Product.findById(item.productId);
      return sum + prod.price * item.quantity;
    }, Promise.resolve(0));

    const updatedCart = await CartRepository.updateTotalPrice(cartId, await totalPrice);
    return updatedCart;
  }

  // Xóa sản phẩm khỏi giỏ hàng
  async removeItem(cartId, productId) {
    const cart = await CartRepository.removeItem(cartId, productId);
    const totalPrice = cart.items.reduce(async (sumPromise, item) => {
      const sum = await sumPromise;
      const prod = await Product.findById(item.productId);
      return sum + prod.price * item.quantity;
    }, Promise.resolve(0));

    const updatedCart = await CartRepository.updateTotalPrice(cartId, await totalPrice);
    return updatedCart;
  }

  // Lấy giỏ hàng theo ID
  async getCartById(cartId) {
    const cart = await CartRepository.getCartById(cartId);
    if (!cart) throw new Error("Không tìm thấy giỏ hàng");
    return cart;
  }

  // Xóa toàn bộ giỏ hàng
  async deleteCart(cartId) {
    const deleted = await CartRepository.deleteCart(cartId);
    if (!deleted) throw new Error("Không thể xóa giỏ hàng");
    return deleted;
  }
}

export default new CartService();
