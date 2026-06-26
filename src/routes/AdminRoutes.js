const express = require("express");
const router = express.Router();

const { protect, authorize } = require("../middleware/authMiddleware");
const {
  getallUsers,
  toggleBlockUser,
  approveRestaurant,
  getAllOrders,
  getPlatformStatistics,
} = require("../controllers/AdminController");

router.use(protect);
router.use(authorize("admin"));

router.get("/", getallUsers);
router.put("/users/:id/block", toggleBlockUser);
router.put("/restaurant/:id/approve", approveRestaurant);
router.get("/statistics", getPlatformStatistics);
router.get("/orders", getAllOrders);

module.exports = router;
