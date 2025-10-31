import ProductRepository from "../repositories/product.repositories.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

class ProductService {
  // Tạo sản phẩm mới
  async createProduct(data, file) {
    if (!data.name || !data.restaurantId) {
      throw new Error("Tên sản phẩm và ID nhà hàng là bắt buộc");
    }

    if (file) {
      const uploadResult = await uploadToCloudinary(file.path, "products");
      data.image = uploadResult.secure_url;
    }

    const product = await ProductRepository.createProduct(data);
    return product;
  }

  // Lấy sản phẩm theo ID
  async getProductById(id) {
    const product = await ProductRepository.getProductById(id);
    if (!product) throw new Error("Không tìm thấy sản phẩm");
    return product;
  }

  // Lấy sản phẩm theo nhà hàng
  async getProductsByRestaurant(restaurantId) {
    return await ProductRepository.getProductsByRestaurant(restaurantId);
  }

  // Lấy sản phẩm theo category
  async getProductsByCategory(category) {
    return await ProductRepository.getProductsByCategory(category);
  }

  // Cập nhật sản phẩm
  async updateProduct(id, data, file) {
    if (file) {
      const uploadResult = await uploadToCloudinary(file.path, "products");
      data.image = uploadResult.secure_url;
    }

    const updated = await ProductRepository.updateProduct(id, data);
    if (!updated) throw new Error("Cập nhật thất bại hoặc sản phẩm không tồn tại");
    return updated;
  }

  // Xóa sản phẩm
  async deleteProduct(id) {
    const deleted = await ProductRepository.deleteProduct(id);
    if (!deleted) throw new Error("Không thể xóa, sản phẩm không tồn tại");
    return deleted;
  }
}

export default new ProductService();
