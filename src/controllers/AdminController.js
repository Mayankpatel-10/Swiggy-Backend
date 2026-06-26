const Order = require("../models/order");
const User = require("../models/User");
const restaurant = require("../models/restaurant");

exports.getallUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({
      success: true,
      data: users,
      count: users.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.isblocked = !user.isblocked;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isblocked ? "blocked" : "unblocked"} successfully`,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.approveRestaurant = async (req, res) => {
  try {
    const Restaurant = await restaurant.findById(req.params.id);

    if (!Restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    Restaurant.isApproved = !Restaurant.isApproved;
    await Restaurant.save();

    res.status(200).json({
      success: true,
      message: `Restaurant ${Restaurant.isApproved ? "approved" : "disapproved"} successfully`,
      data: Restaurant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("restaurant", "name");
    res.status(200).json({
      success: true,
      data: orders,
      count: orders.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getPlatformStatistics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalRestaurants = await restaurant.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: "Paid" } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
    ]);
    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalRestaurants,
        totalOrders,
        totalRevenue:
          totalRevenue.length > 0 ? totalRevenue[0].totalRevenue : 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
