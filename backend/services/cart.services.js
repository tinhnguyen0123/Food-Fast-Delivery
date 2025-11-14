// services/cart.services.js
import CartRepository from "../repositories/cart.repositories.js";
import Product from "../models/product.models.js";
import Restaurant from "../models/restaurant.models.js";

class CartService {
  // 🔹 Tạo giỏ hàng mới cho user
  async createCart(userId) {
    return await CartRepository.createCart(userId);
  }

  // 🔹 Lấy giỏ hàng mới nhất của user
  async getLatestCartByUser(userId) {
    let cart = await CartRepository.getLatestCartByUser(userId);
    if (!cart) {
      return await this.createCart(userId);
    }

    // ✅ Dọn dẹp giỏ hàng: loại bỏ sản phẩm không hợp lệ
    const originalItemCount = cart.items.length;
    const removedItems = [];

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
      cart = await this.getCartById(cart.id);
      cart._sanitized = true;
      cart._removedItems = removedItems;
    }

    return cart;
  }

  // 🔹 Hàm tính tổng tiền
  async calculateTotalPrice(cart) {
    if (!cart || !cart.items || cart.items.length === 0) {
      return 0;
    }

    const populatedCart = await cart.populate("items.productId", "price");

    const totalPrice = populatedCart.items.reduce((sum, item) => {
      if (item.productId && item.productId.price) {
        return sum + item.productId.price * item.quantity;
      }
      return sum;
    }, 0);

    return totalPrice;
  }

  // ✅ Thêm/cập nhật sản phẩm trong giỏ hàng
  async addItem(cartId, productId, quantity) {
    // Kiểm tra sản phẩm hợp lệ
    const product = await Product.findById(productId);
    if (!product) throw new Error("Sản phẩm không tồn tại");
    if (!product.available) {
      throw new Error("Sản phẩm này hiện không có sẵn để thêm vào giỏ hàng.");
    }

    // Lấy giỏ hàng
    let cart = await CartRepository.getCartById(cartId);
    if (!cart) throw new Error("Không tìm thấy giỏ hàng");

    // ✅ Không còn throw nếu món đã tồn tại
    // Repository xử lý như sau:
    // - Nếu đã có: quantity > 0 => cập nhật, <= 0 => xóa khỏi giỏ
    // - Nếu chưa có và quantity > 0 => thêm mới
    let updatedCart = await CartRepository.addItem(cartId, productId, quantity);

    // Tính lại tổng tiền
    const totalPrice = await this.calculateTotalPrice(updatedCart);
    await CartRepository.updateTotalPrice(cartId, totalPrice);

    // Trả về giỏ hàng đã populate đầy đủ
    return this.getCartById(cartId);
  }

  // 🔹 Xóa sản phẩm khỏi giỏ hàng
  async removeItem(cartId, productId) {
    let cart = await CartRepository.removeItem(cartId, productId);

    const totalPrice = await this.calculateTotalPrice(cart);
    await CartRepository.updateTotalPrice(cartId, totalPrice);

    return this.getCartById(cartId);
  }

  // 🔹 Lấy giỏ hàng theo ID
  async getCartById(cartId) {
    const cart = await CartRepository.getCartById(cartId);
    if (!cart) throw new Error("Không tìm thấy giỏ hàng");
    return cart;
  }

  // 🔹 Xóa toàn bộ giỏ hàng
  async deleteCart(cartId) {
    const deleted = await CartRepository.deleteCart(cartId);
    if (!deleted) throw new Error("Không thể xóa giỏ hàng");
    return deleted;
  }
}

export default new CartService();
