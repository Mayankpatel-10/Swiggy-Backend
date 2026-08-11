const Order = require("../models/order");
const User = require("../models/User");
const Restaurant = require("../models/restaurant");
const FraudLog = require("../models/FraudLog");
const SurgeSettings = require("../models/SurgeSettings");
const DeliveryPartner = require("../models/DeliveryPartner");
const pricingService = require("../services/pricingService");
const notificationService = require("../services/notificationService");

/**
 * Get Fraud Dashboard Flagged Orders
 */
exports.getFraudOrders = async (req, res) => {
  try {
    const { riskLevel, status } = req.query;
    const filter = {};

    if (riskLevel) filter.riskLevel = riskLevel;
    if (status) filter.status = status;

    const flaggedLogs = await FraudLog.find(filter)
      .populate({
        path: "order",
        populate: [
          { path: "user", select: "name email phone cancellationCount refundCount ordersCount isRestricted" },
          { path: "restaurant", select: "name cuisine address" },
          { path: "assignedDeliveryPartner" },
        ],
      })
      .populate("user", "name email phone cancellationCount refundCount ordersCount isRestricted")
      .sort({ createdAt: -1 });

    const totalFlagged = await FraudLog.countDocuments({ status: "FLAGGED" });
    const criticalCount = await FraudLog.countDocuments({ riskLevel: "CRITICAL" });
    const highCount = await FraudLog.countDocuments({ riskLevel: "HIGH" });
    const mediumCount = await FraudLog.countDocuments({ riskLevel: "MEDIUM" });
    const suspendedUsersCount = await User.countDocuments({ isRestricted: true });

    return res.status(200).json({
      success: true,
      stats: {
        totalFlagged,
        criticalCount,
        highCount,
        mediumCount,
        suspendedUsersCount,
      },
      data: flaggedLogs,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Approve Flagged Order
 */
exports.approveOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    order.isSuspicious = false;
    order.riskLevel = "LOW";
    await order.save();

    await FraudLog.updateMany(
      { order: orderId },
      {
        status: "APPROVED",
        actionTaken: "Approved by Admin after manual fraud review",
        reviewedBy: req.user._id,
        reviewedAt: new Date(),
      }
    );

    await notificationService.sendNotification({
      userId: order.user,
      title: "Order Approved ✅",
      message: `Your order #${order._id.toString().slice(-6)} has been verified and approved by system admin.`,
      type: "ORDER_UPDATE",
    });

    return res.status(200).json({ success: true, message: "Order approved successfully", data: order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Reject Flagged Order
 */
exports.rejectOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    order.orderStatus = "CANCELLED";
    order.cancellationReason = reason || "Rejected by administrator due to security risk";
    order.timeline.cancelledAt = new Date();
    await order.save();

    await FraudLog.updateMany(
      { order: orderId },
      {
        status: "REJECTED",
        actionTaken: `Rejected by Admin: ${reason || "Security Risk"}`,
        reviewedBy: req.user._id,
        reviewedAt: new Date(),
      }
    );

    await notificationService.sendNotification({
      userId: order.user,
      title: "Order Cancelled by System Admin ⚠️",
      message: `Your order #${order._id.toString().slice(-6)} was rejected during fraud verification.`,
      type: "FRAUD_ALERT",
    });

    return res.status(200).json({ success: true, message: "Order rejected and cancelled", data: order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Restrict User Account
 */
exports.restrictUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.isRestricted = true;
    user.restrictionReason = reason || "Suspicious platform activity detected by system admin";
    await user.save();

    return res.status(200).json({ success: true, message: `User account '${user.name}' restricted`, data: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Unrestrict User Account
 */
exports.unrestrictUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.isRestricted = false;
    user.restrictionReason = "";
    await user.save();

    return res.status(200).json({ success: true, message: `User account '${user.name}' unrestricted`, data: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get Surge Pricing Settings
 */
exports.getSurgeSettings = async (req, res) => {
  try {
    const settings = await pricingService.getOrInitSurgeSettings();
    return res.status(200).json({ success: true, data: settings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update Surge Pricing Settings
 */
exports.updateSurgeSettings = async (req, res) => {
  try {
    let settings = await SurgeSettings.findOne();
    if (!settings) {
      settings = new SurgeSettings(req.body);
    } else {
      Object.assign(settings, req.body);
    }
    await settings.save();

    return res.status(200).json({ success: true, message: "Surge settings updated", data: settings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get Comprehensive Admin Analytics & Dashboard Overview
 */
exports.getAdminDashboardStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments({ role: "customer" });
    const totalRestaurants = await Restaurant.countDocuments();
    const totalDeliveryPartners = await DeliveryPartner.countDocuments();

    // Total Revenue calculation
    const revenueResult = await Order.aggregate([
      { $match: { orderStatus: { $ne: "CANCELLED" } } },
      { $group: { _id: null, totalRevenue: { $sum: "$finalTotal" } } },
    ]);
    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    const activeDeliveries = await Order.countDocuments({
      orderStatus: { $in: ["PREPARING", "READY_FOR_PICKUP", "OUT_FOR_DELIVERY"] },
    });

    const suspiciousOrdersCount = await Order.countDocuments({ isSuspicious: true });
    const cancelledOrdersCount = await Order.countDocuments({ orderStatus: "CANCELLED" });

    // Recent 7 Days Order Chart Data
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const dailyOrders = await Order.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          ordersCount: { $sum: 1 },
          revenue: { $sum: "$finalTotal" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Order Status Distribution
    const statusDistribution = await Order.aggregate([
      { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
    ]);

    return res.status(200).json({
      success: true,
      data: {
        overview: {
          totalOrders,
          totalRevenue,
          totalUsers,
          totalRestaurants,
          totalDeliveryPartners,
          activeDeliveries,
          suspiciousOrdersCount,
          cancelledOrdersCount,
        },
        charts: {
          dailyOrders,
          statusDistribution,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
