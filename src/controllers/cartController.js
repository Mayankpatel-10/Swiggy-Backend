const Cart = require("../models/Cart");
const Menu = require("../models/Menu");

exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate("restaurant")
      .populate("items.menuItem");

    if (!cart) {
      return res.status(200).json({
        success: true,
        data: { user: req.user._id, restaurant: null, items: [], totalAmount: 0 },
      });
    }

    return res.status(200).json({ success: true, data: cart });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { restaurantId, menuItemId, quantity = 1 } = req.body;

    const menuItem = await Menu.findById(menuItemId);
    if (!menuItem) {
      return res.status(404).json({ success: false, message: "Menu item not found" });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({
        user: req.user._id,
        restaurant: restaurantId,
        items: [{ menuItem: menuItemId, quantity }],
        totalAmount: menuItem.price * quantity,
      });
    } else {
      // If adding from a different restaurant, clear old cart items first
      if (cart.restaurant && cart.restaurant.toString() !== restaurantId.toString()) {
        cart.restaurant = restaurantId;
        cart.items = [{ menuItem: menuItemId, quantity }];
      } else {
        const itemIndex = cart.items.findIndex(
          (item) => item.menuItem.toString() === menuItemId.toString()
        );

        if (itemIndex > -1) {
          cart.items[itemIndex].quantity += quantity;
        } else {
          cart.items.push({ menuItem: menuItemId, quantity });
        }
      }
    }

    // Recalculate Total
    let total = 0;
    for (const item of cart.items) {
      const mItem = await Menu.findById(item.menuItem);
      if (mItem) {
        total += mItem.price * item.quantity;
      }
    }
    cart.totalAmount = total;
    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate("restaurant")
      .populate("items.menuItem");

    return res.status(200).json({ success: true, data: populatedCart });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateQuantity = async (req, res) => {
  try {
    const { menuItemId, quantity } = req.body;

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    if (quantity <= 0) {
      cart.items = cart.items.filter((item) => item.menuItem.toString() !== menuItemId.toString());
    } else {
      const itemIndex = cart.items.findIndex(
        (item) => item.menuItem.toString() === menuItemId.toString()
      );
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity = quantity;
      }
    }

    if (cart.items.length === 0) {
      cart.restaurant = null;
      cart.totalAmount = 0;
    } else {
      let total = 0;
      for (const item of cart.items) {
        const mItem = await Menu.findById(item.menuItem);
        if (mItem) {
          total += mItem.price * item.quantity;
        }
      }
      cart.totalAmount = total;
    }

    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate("restaurant")
      .populate("items.menuItem");

    return res.status(200).json({ success: true, data: populatedCart });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    await Cart.findOneAndDelete({ user: req.user._id });
    return res.status(200).json({ success: true, message: "Cart cleared successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
