const express = require("express");
const router = express.Router();
const {
  getMenuByRestaurant,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
} = require("../controllers/menuController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/restaurant/:restaurantId", getMenuByRestaurant);
router.post("/add", protect, authorize("admin", "restaurant_admin"), addMenuItem);
router.put("/update/:id", protect, authorize("admin", "restaurant_admin"), updateMenuItem);
router.delete("/:id", protect, authorize("admin", "restaurant_admin"), deleteMenuItem);

module.exports = router;
