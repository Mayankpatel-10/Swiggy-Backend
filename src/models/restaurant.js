const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    image: {
      type: String,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);
module.exports = mongoose.model("Restaurant", restaurantSchema);
