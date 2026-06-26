const Order = require("../models/order");
const Cart = require("../models/Cart");
const restaurant = require("../models/restaurant");

exports.placeOrder = async (req, res) => {
  try {
    const { deliveryAddress } = req.body;

    const cart = await Cart.findOne({ user: req.user._id })
      .populate("items.menuItem")
      .populate("restaurant");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty"
      });
    }

    if (!cart.restaurant.isApproved) {
      return res.status(400).json({
        success: false,
        message: "Restaurant not approved"
      });
    }

    const items = cart.items.map(item => ({
      menuItem: item.menuItem._id,
      name: item.menuItem.name,
      price: item.menuItem.price,
      quantity: item.quantity
    }));

    const totalAmount = items.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);

    const order = await Order.create({
      user: req.user._id,
      restaurant: cart.restaurant._id,
      items,
      totalAmount,
      deliveryAddress
    });

    await Cart.findOneAndDelete({ user: req.user._id });

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: order
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: orders
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRestaurantOrders = async (req, res) => {
  try {
    const Restaurant = await restaurant.findOne({ owner: req.user._id });

    if (!Restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found"
      });
    }

    const orders = await Order.find({ restaurant: Restaurant._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: orders
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.mockPayment = async (req, res) => {
  const { orderId } = req.body;

  const order = await Order.findById(orderId);

  order.paymentStatus = "Paid";
  order.orderStatus = "Confirmed";

  await order.save();

  res.status(200).json({
    success: true,
    message: "Mock payment successful"
  });
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id)
      .populate("restaurant");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    const Restaurant = await restaurant.findOne({ owner: req.user._id });

    if (!Restaurant || Restaurant._id.toString() !== order.restaurant._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized"
      });
    }

    order.orderStatus = status;
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order status updated",
      data: order
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};