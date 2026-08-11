const mongoose = require("mongoose");

const surgeSettingsSchema = new mongoose.Schema(
  {
    region: {
      type: String,
      default: "Central City",
    },
    isSurgeActive: {
      type: Boolean,
      default: true,
    },
    baseDeliveryFee: {
      type: Number,
      default: 40,
    },
    surgeMultiplier: {
      type: Number,
      default: 1.2, // 1.0x to 2.5x
    },
    demandThreshold: {
      type: Number,
      default: 5,
    },
    peakHours: {
      lunchStart: { type: String, default: "12:00" },
      lunchEnd: { type: String, default: "15:00" },
      dinnerStart: { type: String, default: "19:30" },
      dinnerEnd: { type: String, default: "22:30" },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SurgeSettings", surgeSettingsSchema);
