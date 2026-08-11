const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    cuisine: [
      {
        type: String,
        required: true,
      },
    ],
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
    },
    numRatings: {
      type: Number,
      default: 150,
    },
    deliveryTime: {
      type: Number,
      default: 30, // in minutes
    },
    priceCategory: {
      type: Number,
      default: 2, // 1: $, 2: $$, 3: $$$, 4: $$$$
    },
    isVegetarian: {
      type: Boolean,
      default: false,
    },
    popularityScore: {
      type: Number,
      default: 80,
    },
    image: {
      type: String,
      default: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
    },
    coverImage: {
      type: String,
      default: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
    },
    address: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [77.5946, 12.9716], // Bangalore default coordinates
      },
    },
  },
  { timestamps: true }
);

restaurantSchema.index({ location: "2dsphere" });
restaurantSchema.index({ name: "text", cuisine: "text", description: "text" });

module.exports = mongoose.model("Restaurant", restaurantSchema);
