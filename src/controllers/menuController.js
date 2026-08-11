const Menu = require("../models/Menu");

exports.getMenuByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const items = await Menu.find({ restaurant: restaurantId });
    return res.status(200).json({ success: true, count: items.length, data: items });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.addMenuItem = async (req, res) => {
  try {
    const menuItem = await Menu.create(req.body);
    return res.status(201).json({ success: true, data: menuItem });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateMenuItem = async (req, res) => {
  try {
    const menuItem = await Menu.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!menuItem) {
      return res.status(404).json({ success: false, message: "Menu item not found" });
    }
    return res.status(200).json({ success: true, data: menuItem });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await Menu.findByIdAndDelete(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ success: false, message: "Menu item not found" });
    }
    return res.status(200).json({ success: true, message: "Menu item deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};