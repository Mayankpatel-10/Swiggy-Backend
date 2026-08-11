const express = require("express");
const router = express.Router();
const { getNotifications, markRead } = require("../controllers/notificationController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getNotifications);
router.put("/read", protect, markRead);

module.exports = router;
