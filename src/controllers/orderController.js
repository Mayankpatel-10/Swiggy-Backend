const Order = require("../models/order");
const Menu = require("../models/Menu");
const Restaurant = require("../models/restaurant");
const User = require("../models/User");
const Coupon = require("../models/Coupon");
const Cart = require("../models/Cart");
const pricingService = require("../services/pricingService");
const fraudService = require("../services/fraudService");
const deliveryAssignmentService = require("../services/deliveryAssignmentService");
const recommendationService = require("../services/recommendationService");
const notificationService = require("../services/notificationService");
const { emitOrderStatusUpdate, emitFraudAlert } = require("../sockets/orderSockets");

/**
 * Calculate Delivery Fee API
 */
exports.getDeliveryFeeCalculation = async (req, res) => {
  try {
    const feeCalculation = await pricingService.calculateDeliveryFee();
    return res.status(200).json({
      success: true,
      data: feeCalculation,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Create Order API
 */
exports.createOrder = async (req, res) => {
  try {
    const { restaurantId, items, deliveryAddress, couponCode, paymentMethod = "UPI" } = req.body;

    if (!restaurantId || !items || !Array.isArray(items) || items.length === 0 || !deliveryAddress) {
      return res.status(400).json({ success: false, message: "Please provide restaurant, items, and delivery address" });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: "Restaurant not found" });
    }

    // 1. Validate items & calculate subtotal server-side
    let subtotal = 0;
    const validatedItems = [];
    const cuisineSet = new Set(restaurant.cuisine);

    for (const item of items) {
      const menuItem = await Menu.findById(item.menuItem);
      if (!menuItem || !menuItem.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `Menu item '${item.name || "selected item"}' is no longer available`,
        });
      }
      const qty = parseInt(item.quantity, 10) || 1;
      const itemSubtotal = menuItem.price * qty;
      subtotal += itemSubtotal;

      validatedItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: qty,
      });
    }

    // 2. Validate coupon discount server-side
    let discount = 0;
    let appliedCouponCode = "";

    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
        validUntil: { $gte: new Date() },
      });

      if (coupon && subtotal >= coupon.minOrderAmount) {
        appliedCouponCode = coupon.code;
        if (coupon.discountType === "PERCENTAGE") {
          discount = Math.min((subtotal * coupon.discountValue) / 100, coupon.maxDiscountAmount);
        } else {
          discount = Math.min(coupon.discountValue, coupon.maxDiscountAmount);
        }
      }
    }

    // 3. Dynamic Delivery Fee calculation
    const pricing = await pricingService.calculateDeliveryFee();
    const deliveryFee = pricing.baseDeliveryFee;
    const surgeFee = pricing.surgeFee;

    // 4. Taxes calculation (5% GST)
    const taxes = Math.round((subtotal - discount) * 0.05);

    // 5. Final Total calculation
    const finalTotal = Math.max(0, subtotal - discount + deliveryFee + surgeFee + taxes);

    // 6. Fraud Detection Engine Evaluation
    const riskEval = await fraudService.evaluateOrderRisk({
      userId: req.user._id,
      totalAmount: finalTotal,
      couponCode: appliedCouponCode,
    });

    // 7. Create Order document
    const order = await Order.create({
      user: req.user._id,
      restaurant: restaurantId,
      items: validatedItems,
      subtotal,
      deliveryFee,
      surgeFee,
      discount,
      taxes,
      finalTotal,
      couponCode: appliedCouponCode,
      paymentStatus: "Paid",
      paymentMethod,
      orderStatus: "ORDER_PLACED",
      deliveryAddress,
      riskScore: riskEval.riskScore,
      riskLevel: riskEval.riskLevel,
      isSuspicious: riskEval.isSuspicious,
      fraudReasons: riskEval.reasons,
      timeline: {
        placedAt: new Date(),
      },
    });

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, { $inc: { ordersCount: 1 } });

    // Log to FraudLogs if flagged or medium/high risk
    await fraudService.logFraudEvent(order._id, req.user._id, riskEval);

    if (riskEval.isSuspicious) {
      emitFraudAlert({
        orderId: order._id,
        user: req.user.name,
        riskScore: riskEval.riskScore,
        riskLevel: riskEval.riskLevel,
        reasons: riskEval.reasons,
      });
    }

    // 8. Smart Delivery Partner Auto-Assignment
    const restaurantCoords = restaurant.location?.coordinates || [77.5946, 12.9716];
    const assignedPartner = await deliveryAssignmentService.autoAssignDeliveryPartner(order._id, restaurantCoords);

    // 9. Clear user's Cart
    await Cart.findOneAndDelete({ user: req.user._id });

    // 10. Update User Preference Profile for Recommendation Engine
    await recommendationService.updateUserPreferenceAfterOrder(
      req.user._id,
      restaurantId,
      Array.from(cuisineSet)
    );

    // 11. Send Notification & Emit Socket Event
    await notificationService.sendNotification({
      userId: req.user._id,
      title: "Order Placed Successfully! 🎉",
      message: `Your order #${order._id.toString().slice(-6)} from ${restaurant.name} has been placed.`,
      type: "ORDER_UPDATE",
      link: `/orders/${order._id}/tracking`,
    });

    const populatedOrder = await Order.findById(order._id)
      .populate("restaurant")
      .populate("assignedDeliveryPartner")
      .populate("user", "name email phone");

    emitOrderStatusUpdate(order._id, populatedOrder);

    return res.status(201).json({
      success: true,
      message: riskEval.isSuspicious
        ? "Order created and flagged for administrative verification."
        : "Order created successfully",
      data: populatedOrder,
      surgeInfo: pricing,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Cancel Order API
 */
exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { cancellationReason } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized to cancel this order" });
    }

    if (["DELIVERED", "CANCELLED", "OUT_FOR_DELIVERY"].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order in state '${order.orderStatus}'`,
      });
    }

    order.orderStatus = "CANCELLED";
    order.cancellationReason = cancellationReason || "Cancelled by user";
    order.timeline.cancelledAt = new Date();
    await order.save();

    // Increment user cancellation count for fraud tracking
    await User.findByIdAndUpdate(order.user, { $inc: { cancellationCount: 1 } });

    // Release delivery partner if assigned
    if (order.assignedDeliveryPartner) {
      const DeliveryPartner = require("../models/DeliveryPartner");
      await DeliveryPartner.findByIdAndUpdate(order.assignedDeliveryPartner, {
        $inc: { activeOrdersCount: -1 },
        status: "AVAILABLE",
      });
    }

    await notificationService.sendNotification({
      userId: order.user,
      title: "Order Cancelled",
      message: `Your order #${order._id.toString().slice(-6)} has been cancelled.`,
      type: "ORDER_UPDATE",
    });

    const updatedOrder = await Order.findById(order._id).populate("restaurant").populate("assignedDeliveryPartner");
    emitOrderStatusUpdate(order._id, updatedOrder);

    return res.status(200).json({ success: true, message: "Order cancelled successfully", data: updatedOrder });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get Single Order Details API
 */
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate("restaurant")
      .populate("assignedDeliveryPartner")
      .populate("user", "name email phone");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    return res.status(200).json({ success: true, data: order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get User Order History API
 */
exports.getUserOrderHistory = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("restaurant")
      .populate("assignedDeliveryPartner")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update Order Status API (Admin / Restaurant / Delivery Partner)
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "ORDER_PLACED",
      "RESTAURANT_ACCEPTED",
      "PREPARING",
      "READY_FOR_PICKUP",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELLED",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    order.orderStatus = status;

    // Update timeline timestamps
    if (status === "RESTAURANT_ACCEPTED") order.timeline.acceptedAt = new Date();
    if (status === "PREPARING") order.timeline.preparingAt = new Date();
    if (status === "READY_FOR_PICKUP") order.timeline.readyAt = new Date();
    if (status === "OUT_FOR_DELIVERY") order.timeline.outForDeliveryAt = new Date();
    if (status === "DELIVERED") {
      order.timeline.deliveredAt = new Date();
      order.paymentStatus = "Paid";

      // Decrement delivery partner workload
      if (order.assignedDeliveryPartner) {
        const DeliveryPartner = require("../models/DeliveryPartner");
        const partner = await DeliveryPartner.findById(order.assignedDeliveryPartner);
        if (partner) {
          partner.activeOrdersCount = Math.max(0, partner.activeOrdersCount - 1);
          partner.totalDeliveries += 1;
          if (partner.activeOrdersCount < 3) partner.status = "AVAILABLE";
          await partner.save();
        }
      }
    }

    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate("restaurant")
      .populate("assignedDeliveryPartner")
      .populate("user", "name email phone");

    // Emit Socket.IO event & send notification
    emitOrderStatusUpdate(order._id, updatedOrder);
    await notificationService.sendNotification({
      userId: order.user,
      title: `Order Status: ${status.replace(/_/g, " ")}`,
      message: `Your order status has changed to ${status.replace(/_/g, " ")}`,
      type: "ORDER_UPDATE",
      link: `/orders/${order._id}/tracking`,
    });

    return res.status(200).json({ success: true, data: updatedOrder });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};