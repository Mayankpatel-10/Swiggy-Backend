const express = require("express");
const router = express.Router();
const {
  getCart,
  addToCart,
  updateQuantity,
  clearCart,
} = require("../controllers/cartController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getCart);
router.post("/add", protect, addToCart);
router.put("/quantity", protect, updateQuantity);
router.delete("/clear", protect, clearCart);

module.exports = router;
