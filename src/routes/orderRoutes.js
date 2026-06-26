const express = require("express");
const router = express.Router();

const { protect, authorize } = require("../middleware/authMiddleware");
const {
  placeOrder,
  getMyOrders,
  getRestaurantOrders,
  updateOrderStatus,
  mockPayment,
} = require("../controllers/orderController");

router.use(protect);

router.post("/", authorize("user"), placeOrder);
router.get("/my", authorize("user"), getMyOrders);
router.post("/verify", authorize("user"), mockPayment);
router.get("/restaurant", authorize("restaurant"), getRestaurantOrders);
router.put("/:id/status", authorize("restaurant"), updateOrderStatus);

module.exports = router;
