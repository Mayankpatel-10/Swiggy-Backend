const mongoose = require("mongoose");

const userPreferenceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    preferredCuisines: [
      {
        cuisine: String,
        count: { type: Number, default: 1 },
      },
    ],
    frequentlyOrderedRestaurants: [
      {
        restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },
        count: { type: Number, default: 1 },
      },
    ],
    frequentlyOrderedItems: [
      {
        itemCategory: String,
        count: { type: Number, default: 1 },
      },
    ],
    totalOrdersCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserPreference", userPreferenceSchema);
