const express = require("express");
const router = express.Router();
const {
  getDeliveryFeeCalculation,
  createOrder,
  cancelOrder,
  getOrderById,
  getUserOrderHistory,
  updateOrderStatus,
} = require("../controllers/orderController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.post("/calculate-delivery-fee", getDeliveryFeeCalculation);
router.post("/create", protect, createOrder);
router.post("/cancel/:orderId", protect, cancelOrder);
router.get("/history", protect, getUserOrderHistory);
router.get("/:orderId", protect, getOrderById);
router.put("/update-status/:orderId", protect, updateOrderStatus);

module.exports = router;
