const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    items: [
      {
        menuItem: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Menu",
          required: true,
        },
        name: String,
        price: Number,
        quantity: Number,
      },
    ],
    subtotal: {
      type: Number,
      required: true,
    },
    deliveryFee: {
      type: Number,
      default: 40,
    },
    surgeFee: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    taxes: {
      type: Number,
      default: 0,
    },
    finalTotal: {
      type: Number,
      required: true,
    },
    couponCode: {
      type: String,
      default: "",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Paid",
    },
    paymentMethod: {
      type: String,
      enum: ["CARD", "UPI", "WALLET", "COD"],
      default: "UPI",
    },
    orderStatus: {
      type: String,
      enum: [
        "ORDER_PLACED",
        "RESTAURANT_ACCEPTED",
        "PREPARING",
        "READY_FOR_PICKUP",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "CANCELLED",
      ],
      default: "ORDER_PLACED",
    },
    deliveryAddress: {
      type: String,
      required: true,
    },
    assignedDeliveryPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryPartner",
      default: null,
    },
    // Fraud Detection System Fields
    riskScore: {
      type: Number,
      default: 0, // 0 to 100
    },
    riskLevel: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "LOW",
    },
    isSuspicious: {
      type: Boolean,
      default: false,
    },
    fraudReasons: [
      {
        type: String,
      },
    ],
    cancellationReason: {
      type: String,
      default: "",
    },
    timeline: {
      placedAt: { type: Date, default: Date.now },
      acceptedAt: { type: Date },
      preparingAt: { type: Date },
      readyAt: { type: Date },
      outForDeliveryAt: { type: Date },
      deliveredAt: { type: Date },
      cancelledAt: { type: Date },
    },
  },
  { timestamps: true }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ isSuspicious: 1, riskScore: -1 });
orderSchema.index({ orderStatus: 1 });

module.exports = mongoose.model("Order", orderSchema);
