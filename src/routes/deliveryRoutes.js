const express = require("express");
const router = express.Router();
const {
  getDeliveryPartnerProfile,
  setStatus,
  getAssignedOrders,
  acceptOrder,
  declineOrder,
} = require("../controllers/deliveryController");
const { protect } = require("../middleware/authMiddleware");

router.get("/profile", protect, getDeliveryPartnerProfile);
router.put("/set-status", protect, setStatus);
router.get("/orders", protect, getAssignedOrders);
router.post("/orders/:orderId/accept", protect, acceptOrder);
router.post("/orders/:orderId/decline", protect, declineOrder);

module.exports = router;
