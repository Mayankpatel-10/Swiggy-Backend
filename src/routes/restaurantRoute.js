const express = require("express");
const router = express.Router();
const {
  getRestaurants,
  searchRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
} = require("../controllers/restaurantController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/search", searchRestaurants);
router.get("/", getRestaurants);
router.get("/:id", getRestaurantById);

// Admin Routes
router.post("/create", protect, authorize("admin"), createRestaurant);
router.put("/update/:id", protect, authorize("admin"), updateRestaurant);
router.delete("/:id", protect, authorize("admin"), deleteRestaurant);

module.exports = router;
