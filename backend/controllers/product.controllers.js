import ProductService from "../services/product.services.js";

class ProductController {
  async create(req, res) {
    try {
      const product = await ProductService.createProduct(req.body, req.file);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const product = await ProductService.getProductById(req.params.id);
      res.status(200).json(product);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  async getByRestaurant(req, res) {
    try {
      const products = await ProductService.getProductsByRestaurant(req.params.restaurantId);
      res.status(200).json(products);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getByCategory(req, res) {
    try {
      const products = await ProductService.getProductsByCategory(req.params.category);
      res.status(200).json(products);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async update(req, res) {
    try {
      const updated = await ProductService.updateProduct(req.params.id, req.body, req.file);
      res.status(200).json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const deleted = await ProductService.deleteProduct(req.params.id);
      res.status(200).json(deleted);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

export default new ProductController();
