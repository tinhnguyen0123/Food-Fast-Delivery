import fs from "fs";
import ProductRepository from "../repositories/product.repositories.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

class ProductService {
  // 🟢 Tạo sản phẩm mới
  async createProduct(data, file) {
    if (!data.name || !data.restaurantId) {
      throw new Error("Tên sản phẩm và ID nhà hàng là bắt buộc");
    }

    try {
      if (file) {
        const uploadResult = await uploadToCloudinary(file.path, "products");
        data.image = uploadResult.url;
        data.imagePublicId = uploadResult.public_id;
        fs.unlinkSync(file.path); // Xóa file tạm sau khi upload
      }

      const product = await ProductRepository.createProduct(data);
      return product;
    } catch (error) {
      console.error("❌ Lỗi khi tạo sản phẩm:", error);
      throw new Error("Không thể tạo sản phẩm: " + error.message);
    }
  }

  // 🔍 Lấy sản phẩm theo ID
  async getProductById(id) {
    const product = await ProductRepository.getProductById(id);
    if (!product) throw new Error("Không tìm thấy sản phẩm");
    return product;
  }

  // 📦 Lấy sản phẩm theo nhà hàng
  async getProductsByRestaurant(restaurantId) {
    return await ProductRepository.getProductsByRestaurant(restaurantId);
  }

  // 🏷️ Lấy sản phẩm theo category
  async getProductsByCategory(category) {
    return await ProductRepository.getProductsByCategory(category);
  }

  // ✏️ Cập nhật sản phẩm
  async updateProduct(id, data, file) {
    const product = await ProductRepository.getProductById(id);
    if (!product) throw new Error("Không tìm thấy sản phẩm để cập nhật");

    try {
      if (file) {
        // Nếu có ảnh cũ, xóa khỏi Cloudinary
        if (product.imagePublicId) {
          await deleteFromCloudinary(product.imagePublicId);
        }

        const uploadResult = await uploadToCloudinary(file.path, "products");
        data.image = uploadResult.url;
        data.imagePublicId = uploadResult.public_id;
        fs.unlinkSync(file.path);
      }

      const updated = await ProductRepository.updateProduct(id, data);
      if (!updated) throw new Error("Cập nhật thất bại hoặc sản phẩm không tồn tại");
      return updated;
    } catch (error) {
      console.error("❌ Lỗi khi cập nhật sản phẩm:", error);
      throw new Error("Không thể cập nhật sản phẩm: " + error.message);
    }
  }

  // 🗑️ Xóa sản phẩm
  async deleteProduct(id) {
    const product = await ProductRepository.getProductById(id);
    if (!product) throw new Error("Không thể xóa, sản phẩm không tồn tại");

    try {
      // Nếu có ảnh cũ → xóa khỏi Cloudinary
      if (product.imagePublicId) {
        await deleteFromCloudinary(product.imagePublicId);
      }

      const deleted = await ProductRepository.deleteProduct(id);
      if (!deleted) throw new Error("Không thể xóa sản phẩm");
      return deleted;
    } catch (error) {
      console.error("❌ Lỗi khi xóa sản phẩm:", error);
      throw new Error("Xóa sản phẩm thất bại: " + error.message);
    }
  }
}

export default new ProductService();
