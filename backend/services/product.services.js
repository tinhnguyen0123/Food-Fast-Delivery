import fs from "fs";
import Product from "../models/product.models.js"; // ✅ truy vấn trực tiếp nếu cần
import ProductRepository from "../repositories/product.repositories.js";
import RestaurantRepository from "../repositories/restaurant.repositories.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

class ProductService {
  // 🟢 Tạo sản phẩm mới
  async createProduct(data, file) {
    if (!data.name || !data.restaurantId) {
      throw new Error("Tên sản phẩm và ID nhà hàng là bắt buộc");
    }

    // ✅ Kiểm tra trạng thái nhà hàng trước khi tạo sản phẩm
    const restaurant = await RestaurantRepository.getRestaurantById(data.restaurantId);
    if (!restaurant) throw new Error("Nhà hàng không tồn tại");
    if (restaurant.status === "suspended") throw new Error("Nhà hàng đã bị khóa");
    if (restaurant.status !== "verified") throw new Error("Nhà hàng chưa được duyệt");

    // 🔹 Kiểm tra category hợp lệ
    const allowed = Product.schema.path("category")?.options?.enum || [];
    if (!data.category || !allowed.includes(data.category)) {
      data.category = allowed[0]; // mặc định category đầu tiên
    }

    try {
      if (file) {
        const uploadResult = await uploadToCloudinary(file.path, "products");
        data.image = uploadResult.url;
        data.imagePublicId = uploadResult.public_id;
        fs.unlinkSync(file.path);
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

  // 📦 Lấy sản phẩm theo nhà hàng (dành cho khách hàng)
  async getProductsByRestaurant(restaurantId) {
    // ✅ FIX: Lấy tất cả sản phẩm, bao gồm cả món bị ẩn, để frontend xử lý hiển thị
    return await ProductRepository.getAllProductsByRestaurant(restaurantId);
  }

  // 📦 Lấy TẤT CẢ sản phẩm theo nhà hàng (DÀNH CHO CHỦ)
  async getAllProductsByRestaurant(restaurantId) {
    return await ProductRepository.getAllProductsByRestaurant(restaurantId);
  }

  // 🏷️ Lấy sản phẩm theo category (chỉ hiển thị nếu nhà hàng đã verified)
  async getProductsByCategory(category) {
    try {
      const query = !category || category === "all" ? {} : { category }; // Không lọc theo `available` nữa
      const products = await Product.find(query)
        .sort({ createdAt: -1 })
        .populate({
          path: "restaurantId",
          select: "name address status",
          match: { status: "verified" },
        });

      // 🔹 Chỉ giữ sản phẩm thuộc nhà hàng đã verified
      return products.filter((p) => !!p.restaurantId);
    } catch (error) {
      console.error("❌ Lỗi khi lấy sản phẩm theo category:", error);
      throw new Error("Không thể lấy sản phẩm theo category: " + error.message);
    }
  }

  // ✏️ Cập nhật sản phẩm
  async updateProduct(id, data, file) {
    const product = await ProductRepository.getProductById(id);
    if (!product) throw new Error("Không tìm thấy sản phẩm để cập nhật");

    // 🔹 Kiểm tra category hợp lệ khi cập nhật
    if (data?.category) {
      const allowed = Product.schema.path("category")?.options?.enum || [];
      if (!allowed.includes(data.category)) {
        throw new Error("Danh mục không hợp lệ");
      }
    }

    try {
      if (file) {
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

  // 🔹 Lấy danh sách danh mục (distinct) — lọc null/undefined
  async getDistinctCategories() {
    const cats = await ProductRepository.getDistinctCategories();
    return (cats || []).filter(Boolean);
  }

  // 🔹 Lấy danh mục theo nhà hàng (distinct) — lọc null/undefined
  async getDistinctCategoriesByRestaurant(restaurantId) {
    const cats = await ProductRepository.getDistinctCategoriesByRestaurant(restaurantId);
    return (cats || []).filter(Boolean);
  }
}

export default new ProductService();
