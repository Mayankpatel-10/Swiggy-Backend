const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  street: String,
  city: String,
  state: String,
  zipCode: String,
  isDefault: { type: Boolean, default: false }
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      select: false
    },
    role: {
      type: String,
      enum: ["customer", "admin", "delivery_partner", "restaurant_admin"],
      default: "customer"
    },
    phone: {
      type: String,
      default: ""
    },
    addresses: [addressSchema],
    isRestricted: {
      type: Boolean,
      default: false
    },
    restrictionReason: {
      type: String,
      default: ""
    },
    cancellationCount: {
      type: Number,
      default: 0
    },
    refundCount: {
      type: Number,
      default: 0
    },
    ordersCount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
