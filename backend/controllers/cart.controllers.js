import CartService from "../services/cart.services.js";

class CartController {
  async createCart(req, res) {
    try {
      const cart = await CartService.createCart(req.user.id);
      res.status(201).json(cart);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getLatestCart(req, res) {
    try {
      const cart = await CartService.getLatestCartByUser(req.user.id);
      res.status(200).json(cart);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  async addItem(req, res) {
    try {
      const { cartId, productId, quantity } = req.body;
      const updatedCart = await CartService.addItem(cartId, productId, quantity);
      res.status(200).json(updatedCart);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async removeItem(req, res) {
    try {
      const { cartId, productId } = req.body;
      const updatedCart = await CartService.removeItem(cartId, productId);
      res.status(200).json(updatedCart);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const cart = await CartService.getCartById(req.params.id);
      res.status(200).json(cart);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  async deleteCart(req, res) {
    try {
      const deleted = await CartService.deleteCart(req.params.id);
      res.status(200).json(deleted);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

export default new CartController();
