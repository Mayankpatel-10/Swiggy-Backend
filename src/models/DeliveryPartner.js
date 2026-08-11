const mongoose = require("mongoose");

const deliveryPartnerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    vehicleType: {
      type: String,
      enum: ["BIKE", "SCOOTER", "BICYCLE"],
      default: "BIKE",
    },
    status: {
      type: String,
      enum: ["AVAILABLE", "BUSY", "OFFLINE"],
      default: "AVAILABLE",
    },
    currentLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [77.5946, 12.9716],
      },
    },
    activeOrdersCount: {
      type: Number,
      default: 0,
    },
    totalDeliveries: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 4.8,
    },
  },
  { timestamps: true }
);

deliveryPartnerSchema.index({ currentLocation: "2dsphere" });
deliveryPartnerSchema.index({ status: 1 });

module.exports = mongoose.model("DeliveryPartner", deliveryPartnerSchema);
