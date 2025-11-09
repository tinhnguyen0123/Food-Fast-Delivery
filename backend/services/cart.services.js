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

  // Hàm tính tổng tiền được tối ưu hóa
  async calculateTotalPrice(cart) {
    if (!cart || !cart.items || cart.items.length === 0) {
      return 0;
    }

    // Lấy thông tin đầy đủ của tất cả sản phẩm trong giỏ hàng
    const populatedCart = await cart.populate("items.productId", "price");

    // Tính tổng tiền dựa trên dữ liệu đã populate
    const totalPrice = populatedCart.items.reduce((sum, item) => {
      if (item.productId && item.productId.price) {
        return sum + item.productId.price * item.quantity;
      }
      return sum;
    }, 0);

    return totalPrice;
  }

  // Thêm sản phẩm vào giỏ hàng
  async addItem(cartId, productId, quantity) {
    const product = await Product.findById(productId);
    if (!product) throw new Error("Sản phẩm không tồn tại");

    let cart = await CartRepository.addItem(cartId, productId, quantity);

    // Tính lại tổng tiền
    const totalPrice = await this.calculateTotalPrice(cart);
    await CartRepository.updateTotalPrice(cartId, totalPrice);

    // Trả về giỏ hàng đã được populate đầy đủ
    return this.getCartById(cartId);
  }

  // Xóa sản phẩm khỏi giỏ hàng
  async removeItem(cartId, productId) {
    let cart = await CartRepository.removeItem(cartId, productId);

    // Tính lại tổng tiền
    const totalPrice = await this.calculateTotalPrice(cart);
    await CartRepository.updateTotalPrice(cartId, totalPrice);

    // Trả về giỏ hàng đã được populate đầy đủ
    return this.getCartById(cartId);
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
