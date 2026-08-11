/**
 * Core System Unit & Algorithm Tests for Swiggy Food Delivery Platform
 */
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const { evaluateOrderRisk } = require("../services/fraudService");
const { calculateDistanceKM } = require("../services/deliveryAssignmentService");

async function runTests() {
  console.log("🧪 Starting Backend Unit & Algorithm Tests...\n");
  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
    }
  }

  try {
    await connectDB();

    const testUser = await User.findOne({ email: "customer@example.com" });
    const userId = testUser ? testUser._id : new mongoose.Types.ObjectId();

    // 1. Haversine Distance Calculation Test
    console.log("📍 Test Group 1: Geo-Spatial Haversine Distance");
    const distance = calculateDistanceKM([77.5946, 12.9716], [77.6400, 12.9780]); // MG Road to Indiranagar
    assert(distance > 4.5 && distance < 6.0, `Calculated distance (~5.1 km): ${distance.toFixed(2)} km`);

    // 2. Fraud Risk Score Engine Tests
    console.log("\n🛡️ Test Group 2: Rule-Based Fraud Risk Engine Scoring");
    
    // Normal order evaluation
    const lowRisk = await evaluateOrderRisk({ userId, totalAmount: 450, couponCode: null });
    assert(lowRisk.riskScore < 30, `Normal transaction assigns LOW risk level (Score: ${lowRisk.riskScore})`);

    // High order value check
    const highVal = await evaluateOrderRisk({ userId, totalAmount: 6500, couponCode: null });
    assert(highVal.reasons.some(r => r.toLowerCase().includes("high order value")), "High value > ₹5000 triggers risk penalty");

    console.log(`\n🎉 Test Results: ${passed}/${total} assertions passed successfully.`);
    await mongoose.connection.close();
    process.exit(passed === total ? 0 : 1);
  } catch (err) {
    console.error("Test execution failure:", err);
    process.exit(1);
  }
}

runTests();
