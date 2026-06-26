const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const {
  addMenuItem,
  deleteMenuItem,
  updateMenuItem,
  getMenuByRestaurant,
} = require("../controllers/menuController");

router.post("/", protect, addMenuItem);
router.get("/:restaurantId", getMenuByRestaurant);
router.delete("/:id", protect, deleteMenuItem);
router.put("/:id", protect, updateMenuItem);

module.exports = router;
