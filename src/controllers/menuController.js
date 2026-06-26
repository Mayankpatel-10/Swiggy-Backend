const Menu = require("../models/Menu");
const restaurant = require("../models/restaurant");

exports.addMenuItem = async (req, res) => {
  try {
    if (req.user.role !== "restaurant") {
      return res.status(403).json({
        success: false,
        message: "Only restaurant owners can add menu items"
      });
    }

    const Restaurant = await restaurant.findOne({ owner: req.user._id });

    if (!Restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found"
      });
    }

    if (!Restaurant.isApproved) {
      return res.status(403).json({
        success: false,
        message: "Restaurant not approved yet"
      });
    }

    const menuItem = await Menu.create({
      ...req.body,
      restaurant: Restaurant._id
    });

    res.status(201).json({
      success: true,
      message: "Menu item added successfully",
      data: menuItem
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMenuByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { isVeg, minPrice, maxPrice, category } = req.query;

    const query = {
      restaurant: restaurantId,
      isAvailable: true
    };
    if (isVeg) {
      query.isVeg = isVeg === "true";
    }

    if (minPrice && maxPrice) {
      query.price = {
        $gte: Number(minPrice),
        $lte: Number(maxPrice)
      };
    }

    if (category) {
      query.category = category;
    }

    const menu = await Menu.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: menu.length,
      data: menu
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateMenuItem = async (req, res) => {
  try {
    const menuItem = await Menu.findById(req.params.id).populate("restaurant");

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found"
      });
    }

    if (menuItem.restaurant.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this item"
      });
    }

    const updated = await Menu.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Menu item updated",
      data: updated
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await Menu.findById(req.params.id).populate("restaurant");

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found"
      });
    }

    if (menuItem.restaurant.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this item"
      });
    }

    await menuItem.deleteOne();

    res.status(200).json({
      success: true,
      message: "Menu item deleted"
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};