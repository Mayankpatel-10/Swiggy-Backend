const Cart = require("../models/Cart");
const Menu = require("../models/Menu");

exports.addToCart = async (req, res) => {
  try {
    const { menuItemId, quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid quantity",
      });
    }

    const menuItem = await Menu.findById(menuItemId).populate("restaurant");

    if (!menuItem || !menuItem.isAvailable) {
      return res.status(404).json({
        success: false,
        message: "Menu item not available",
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({
        user: req.user._id,
        restaurant: menuItem.restaurant._id,
        items: [{ menuItem: menuItem._id, quantity }],
      });
    } else {
      if (cart.restaurant.toString() !== menuItem.restaurant._id.toString()) {
        return res.status(400).json({
          success: false,
          message: "You can order from only one restaurant at a time",
        });
      }

      const existingItem = cart.items.find(
        (item) => item.menuItem.toString() === menuItemId,
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ menuItem: menuItemId, quantity });
      }
    }

    await cart.populate("items.menuItem");

    cart.totalAmount = cart.items.reduce((total, item) => {
      return total + item.menuItem.price * item.quantity;
    }, 0);

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Item added to cart",
      data: cart,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.menuItem",
    );

    if (!cart) {
      return res.status(200).json({
        success: true,
        message: "Cart is empty",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.menuItem",
    );

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const item = cart.items.find((i) => i._id.toString() === req.params.itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    if (quantity <= 0) {
      cart.items = cart.items.filter(
        (i) => i._id.toString() !== req.params.itemId,
      );
    } else {
      item.quantity = quantity;
    }

    cart.totalAmount = cart.items.reduce((total, item) => {
      return total + item.menuItem.price * item.quantity;
    }, 0);

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart updated",
      data: cart,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.removeCartItem = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.menuItem",
    );

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    cart.items = cart.items.filter(
      (item) => item._id.toString() !== req.params.itemId,
    );

    cart.totalAmount = cart.items.reduce((total, item) => {
      return total + item.menuItem.price * item.quantity;
    }, 0);

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Item removed",
      data: cart,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    await Cart.findOneAndDelete({ user: req.user._id });

    res.status(200).json({
      success: true,
      message: "Cart cleared",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
