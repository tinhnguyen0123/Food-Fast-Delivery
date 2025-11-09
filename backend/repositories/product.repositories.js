import Product from "../models/product.models.js";

class ProductRepository {
  // Tạo product mới
  async createProduct(productData) {
    const product = new Product(productData);
    return await product.save();
  }

  // Lấy product theo ID
  async getProductById(productId) {
    return await Product.findById(productId)
      .populate("restaurantId", "name address");
  }

  // Lấy tất cả product của 1 nhà hàng (dành cho trang khách hàng)
  async getProductsByRestaurant(restaurantId) {
    return await Product.find({ restaurantId, available: true }).sort({ createdAt: -1 });
  }

  // 📦 DÀNH CHO CHỦ NHÀ HÀNG (lấy tất cả món)
  async getAllProductsByRestaurant(restaurantId) {
    return await Product.find({ restaurantId }).sort({ createdAt: -1 });
  }

  // Lấy product theo category (ví dụ: noodle, drink, fastfood)
  async getProductsByCategory(category) {
    if (!category || category === "all") {
      // Trả về tất cả sản phẩm
      return await Product.find().sort({ createdAt: -1 });
    }
    return await Product.find({ category }).sort({ createdAt: -1 });
  }

  // Cập nhật product
  async updateProduct(productId, updateData) {
    return await Product.findByIdAndUpdate(productId, updateData, { new: true });
  }

  // Xóa product
  async deleteProduct(productId) {
    return await Product.findByIdAndDelete(productId);
  }

  // Lấy danh sách danh mục (fixed list từ enum)
  async getDistinctCategories() {
    const cats = Product.schema.path("category")?.options?.enum || [];
    return cats;
  }

  // Lấy danh mục theo nhà hàng (cũng trả danh sách cố định)
  async getDistinctCategoriesByRestaurant(_restaurantId) {
    const cats = Product.schema.path("category")?.options?.enum || [];
    return cats;
  }
}

export default new ProductRepository();
