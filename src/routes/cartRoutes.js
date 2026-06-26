const express = require("express");
const router = express.Router();

const { protect, authorize } = require("../middleware/authMiddleware");
const {
  addToCart,
  getCart,
  updateCartItem,
  clearCart,
} = require("../controllers/cartController");

router.use(protect);
router.use(authorize("user"));
router.post("/", addToCart);
router.get("/", getCart);
router.put("/:itemId", updateCartItem);
router.delete("/", clearCart);

module.exports = router;
