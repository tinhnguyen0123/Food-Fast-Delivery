// services/cart.services.js
import CartRepository from "../repositories/cart.repositories.js";
import Product from "../models/product.models.js";
import Restaurant from "../models/restaurant.models.js";

class CartService {
  // Tạo giỏ hàng mới cho user
  async createCart(userId) {
    return await CartRepository.createCart(userId);
  }

  // Lấy giỏ hàng mới nhất của user
  async getLatestCartByUser(userId) {
    let cart = await CartRepository.getLatestCartByUser(userId);
    if (!cart) {
      // Nếu không có giỏ hàng, tạo một giỏ hàng mới
      return await this.createCart(userId);
    }

    // ✅ Dọn dẹp giỏ hàng: loại bỏ các sản phẩm không hợp lệ
    const originalItemCount = cart.items.length;
    const removedItems = [];

    // Populate đầy đủ để kiểm tra
    await cart.populate({
      path: "items.productId",
      populate: { path: "restaurantId", model: "Restaurant", select: "status" },
    });

    const validItems = cart.items.filter((item) => {
      const product = item.productId;
      if (
        !product ||
        !product.available ||
        !product.restaurantId ||
        product.restaurantId.status !== "verified"
      ) {
        removedItems.push(product?.name || "Một món ăn");
        return false;
      }
      return true;
    });

    if (validItems.length < originalItemCount) {
      cart.items = validItems;
      await cart.save();
      cart = await this.getCartById(cart.id); // Lấy lại giỏ hàng đã cập nhật
      cart._sanitized = true;
      cart._removedItems = removedItems;
    }

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

  // 🔹 Thêm sản phẩm vào giỏ hàng
  async addItem(cartId, productId, quantity) {
    // Validate product tồn tại và available
    const product = await Product.findById(productId);
    if (!product) throw new Error("Sản phẩm không tồn tại");
    if (!product.available) {
      throw new Error("Sản phẩm này hiện không có sẵn để thêm vào giỏ hàng.");
    }

    // Lấy giỏ hàng hiện tại để kiểm tra nếu món đã có
    const cart = await CartRepository.getCartById(cartId);
    if (!cart) throw new Error("Không tìm thấy giỏ hàng");

    const exists = cart.items.some((item) => {
      const pid = (item.productId && (item.productId._id || item.productId)).toString();
      return pid === productId.toString();
    });

    if (exists) {
      // Trả lỗi cụ thể để frontend hiển thị thông báo "đã có món"
      throw new Error(`"${product.name}" đã có trong giỏ`);
    }

    // Nếu chưa có thì thêm như bình thường
    let updatedCart = await CartRepository.addItem(cartId, productId, quantity);

    // Tính lại tổng tiền
    const totalPrice = await this.calculateTotalPrice(updatedCart);
    await CartRepository.updateTotalPrice(cartId, totalPrice);

    // Trả về giỏ hàng đã populate đầy đủ
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
