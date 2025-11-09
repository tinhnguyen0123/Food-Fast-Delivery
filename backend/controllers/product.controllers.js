import ProductService from "../services/product.services.js";

class ProductController {
  // 🟢 Tạo sản phẩm mới
  async create(req, res) {
    try {
      const product = await ProductService.createProduct(req.body, req.file);
      res.status(201).json(product);
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  }

  // 🔍 Lấy sản phẩm theo ID
  async getById(req, res) {
    try {
      const product = await ProductService.getProductById(req.params.id);
      res.status(200).json(product);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  // 📦 Lấy sản phẩm theo nhà hàng (DÀNH CHO KHÁCH - PUBLIC)
  async getByRestaurant(req, res) {
    try {
      const products = await ProductService.getProductsByRestaurant(req.params.restaurantId);
      res.status(200).json(products);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // 📦 Lấy TẤT CẢ sản phẩm theo nhà hàng (DÀNH CHO CHỦ - PRIVATE)
  async getMyRestaurantProducts(req, res) {
    try {
      const products = await ProductService.getAllProductsByRestaurant(
        req.params.restaurantId
      );
      res.status(200).json(products);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // 🏷️ Lấy sản phẩm theo category
  async getByCategory(req, res) {
    try {
      const products = await ProductService.getProductsByCategory(req.params.category);
      res.status(200).json(products);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // ✏️ Cập nhật sản phẩm
  async update(req, res) {
    try {
      const updated = await ProductService.updateProduct(req.params.id, req.body, req.file);
      res.status(200).json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // 🗑️ Xóa sản phẩm
  async delete(req, res) {
    try {
      const deleted = await ProductService.deleteProduct(req.params.id);
      res.status(200).json(deleted);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // 🔹 Lấy danh sách danh mục (distinct)
  async getCategories(_req, res) {
    try {
      const categories = await ProductService.getDistinctCategories();
      res.status(200).json(categories);
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  }

  // 🔹 Lấy danh mục theo nhà hàng (distinct)
  async getCategoriesByRestaurant(req, res) {
    try {
      const { restaurantId } = req.params;
      const categories = await ProductService.getDistinctCategoriesByRestaurant(restaurantId);
      res.status(200).json(categories);
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  }
}

export default new ProductController();
