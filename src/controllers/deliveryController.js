const DeliveryPartner = require("../models/DeliveryPartner");
const Order = require("../models/order");
const deliveryAssignmentService = require("../services/deliveryAssignmentService");
const { emitOrderStatusUpdate } = require("../sockets/orderSockets");
const notificationService = require("../services/notificationService");

exports.getDeliveryPartnerProfile = async (req, res) => {
  try {
    let partner = await DeliveryPartner.findOne({ user: req.user._id });
    if (!partner) {
      partner = await DeliveryPartner.create({
        user: req.user._id,
        name: req.user.name,
        phone: req.user.phone || "9876543210",
        vehicleType: "BIKE",
        status: "AVAILABLE",
      });
    }
    return res.status(200).json({ success: true, data: partner });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.setStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["AVAILABLE", "BUSY", "OFFLINE"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    let partner = await DeliveryPartner.findOne({ user: req.user._id });
    if (!partner) {
      partner = new DeliveryPartner({
        user: req.user._id,
        name: req.user.name,
        phone: req.user.phone || "9876543210",
        status,
      });
    } else {
      partner.status = status;
    }
    await partner.save();

    return res.status(200).json({ success: true, message: `Status set to ${status}`, data: partner });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAssignedOrders = async (req, res) => {
  try {
    let partner = await DeliveryPartner.findOne({ user: req.user._id });
    if (!partner) {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    const orders = await Order.find({ assignedDeliveryPartner: partner._id })
      .populate("restaurant")
      .populate("user", "name phone email deliveryAddress")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.acceptOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    order.orderStatus = "RESTAURANT_ACCEPTED";
    order.timeline.acceptedAt = new Date();
    await order.save();

    const updatedOrder = await Order.findById(order._id).populate("restaurant").populate("assignedDeliveryPartner");
    emitOrderStatusUpdate(order._id, updatedOrder);

    return res.status(200).json({ success: true, message: "Order accepted", data: updatedOrder });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.declineOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const partner = await DeliveryPartner.findOne({ user: req.user._id });

    if (partner) {
      partner.activeOrdersCount = Math.max(0, partner.activeOrdersCount - 1);
      await partner.save();
    }

    // Auto-reassign to next available partner
    const reallocatedPartner = await deliveryAssignmentService.reassignDeliveryPartner(
      orderId,
      partner ? partner._id : null
    );

    const updatedOrder = await Order.findById(orderId)
      .populate("restaurant")
      .populate("assignedDeliveryPartner");

    if (updatedOrder) {
      emitOrderStatusUpdate(orderId, updatedOrder);
    }

    return res.status(200).json({
      success: true,
      message: reallocatedPartner
        ? `Order declined. Reassigned to partner '${reallocatedPartner.name}'`
        : "Order declined. Pending partner assignment.",
      data: updatedOrder,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
