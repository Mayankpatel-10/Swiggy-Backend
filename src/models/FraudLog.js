const mongoose = require("mongoose");

const fraudLogSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    riskScore: {
      type: Number,
      required: true,
    },
    riskLevel: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      required: true,
    },
    reasons: [
      {
        type: String,
      },
    ],
    status: {
      type: String,
      enum: ["FLAGGED", "APPROVED", "REJECTED"],
      default: "FLAGGED",
    },
    actionTaken: {
      type: String,
      default: "",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

fraudLogSchema.index({ status: 1, riskScore: -1 });

module.exports = mongoose.model("FraudLog", fraudLogSchema);
