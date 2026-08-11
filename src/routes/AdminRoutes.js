const express = require("express");
const router = express.Router();
const {
  getFraudOrders,
  approveOrder,
  rejectOrder,
  restrictUser,
  unrestrictUser,
  getSurgeSettings,
  updateSurgeSettings,
  getAdminDashboardStats,
} = require("../controllers/AdminController");
const { protect, authorize } = require("../middleware/authMiddleware");

// All admin routes protected with admin authorization
router.use(protect);
router.use(authorize("admin"));

router.get("/dashboard-stats", getAdminDashboardStats);

// Fraud Monitoring Routes
router.get("/fraud/orders", getFraudOrders);
router.post("/fraud/orders/:orderId/approve", approveOrder);
router.post("/fraud/orders/:orderId/reject", rejectOrder);

// User Restriction Routes
router.post("/users/:userId/restrict", restrictUser);
router.post("/users/:userId/unrestrict", unrestrictUser);

// Surge Pricing Settings Routes
router.get("/surge-settings", getSurgeSettings);
router.put("/surge-settings", updateSurgeSettings);

module.exports = router;
