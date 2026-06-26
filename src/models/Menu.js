const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true
    },
    name: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    category: {
      type: String
    },
    isVeg: {
      type: Boolean,
      default: false
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    image: {
      type: String
    }
  },
  { timestamps: true }
);

// Index for search performance
menuSchema.index({ name: "text" });

module.exports = mongoose.model("Menu", menuSchema);