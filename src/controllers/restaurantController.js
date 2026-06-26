const restaurant = require("../models/restaurant");

exports.createRestaurant = async (req, res) => {
  try {
    if (req.user.role !== "restaurant") {
      return res.status(403).json({
        success: false,
        message: "Only restaurant owners can create restaurants",
      });
    }
    const existingRestaurant = await restaurant.findOne({
      owner: req.user._id,
    });
    if (existingRestaurant) {
      return res.status(400).json({
        success: false,
        message: "You already have a restaurant registered",
      });
    }
    const createdRestaurant = await restaurant.create({
      ...req.body,
      owner: req.user._id,
    });
    res.status(201).json({
      success: true,
      message: "Restaurant created successfully",
      data: createdRestaurant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating restaurant",
      error: error.message,
    });
  }
};

exports.getMyRestaurant = async (req, res) => {
  try {
    const myRestaurant = await restaurant.findOne({ owner: req.user._id });
    if (!myRestaurant) {
      return res.status(404).json({
        success: false,
        message: "You don't have a restaurant registered",
      });
    }
    res.status(200).json({
      success: true,
      data: myRestaurant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching restaurant",
      error: error.message,
    });
  }
};

exports.updateRestaurant = async (req, res) => {
  try {
    const myRestaurant = await restaurant.findOne({ owner: req.user._id });
    if (!myRestaurant) {
      return res.status(404).json({
        success: false,
        message: "You don't have a restaurant registered",
      });
    }
    if (myRestaurant.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this restaurant",
      });
    }
    const updatedRestaurant = await restaurant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    res.status(200).json({
      success: true,
      message: "Restaurant updated successfully",
      data: updatedRestaurant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating restaurant",
      error: error.message,
    });
  }
};
exports.getAllRestaurants = async (req, res) => {
  try {
    const { city, page = 1, limit = 10 } = req.query;
    const query = { isApproved: true };
    if (city) {
      query.city = city;
    }
    const restaurants = await restaurant
      .find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: restaurants,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching restaurants",
      error: error.message,
    });
  }
};
