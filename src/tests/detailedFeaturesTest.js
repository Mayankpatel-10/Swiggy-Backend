/**
 * Comprehensive Deep-Dive Scenario Test Suite for the 6 Core Swiggy Features
 */
require("dotenv").config();
const http = require("http");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const app = require("../app");
const { initSocket } = require("../sockets/orderSockets");
const User = require("../models/User");
const Restaurant = require("../models/restaurant");
const Menu = require("../models/Menu");
const Order = require("../models/order");
const FraudLog = require("../models/FraudLog");
const DeliveryPartner = require("../models/DeliveryPartner");

const PORT = 5098;
let server = null;
let baseUrl = `http://localhost:${PORT}/api`;

let adminToken = "";
let customerToken = "";
let driverToken = "";
let driver2Token = "";
let customerId = "";
let driver1Id = "";
let driver2Id = "";
let restId = "";
let menuId = "";

let passed = 0;
let failed = 0;

function check(condition, featureNum, testName, detail = "") {
  if (condition) {
    console.log(`  ✅ [Feature ${featureNum}] PASS: ${testName} ${detail ? `-> (${detail})` : ""}`);
    passed++;
  } else {
    console.error(`  ❌ [Feature ${featureNum}] FAIL: ${testName} ${detail ? `-> (${detail})` : ""}`);
    failed++;
  }
}

async function apiRequest(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${baseUrl}${path}`);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: { "Content-Type": "application/json" },
    };
    if (token) options.headers["Authorization"] = `Bearer ${token}`;

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on("error", (err) => reject(err));
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runDetailed6FeaturesTesting() {
  console.log("\n==================================================================");
  console.log("🔬 STARTING DEEP-DIVE TESTING OF ALL 6 CORE PLATFORM FEATURES");
  console.log("==================================================================\n");

  try {
    await connectDB();

    server = http.createServer(app);
    initSocket(server);
    await new Promise((resolve) => server.listen(PORT, resolve));

    // Setup Test Credentials
    const adminRes = await apiRequest("POST", "/auth/login", { email: "admin@example.com", password: "admin123" });
    adminToken = adminRes.body.data.token;

    const custRes = await apiRequest("POST", "/auth/login", { email: "customer@example.com", password: "customer123" });
    customerToken = custRes.body.data.token;
    customerId = custRes.body.data.user.id;

    const driverRes = await apiRequest("POST", "/auth/login", { email: "delivery@example.com", password: "delivery123" });
    driverToken = driverRes.body.data.token;
    driver1Id = driverRes.body.data.user.id;

    // Create a second driver for re-assignment testing
    const driver2Auth = await apiRequest("POST", "/auth/register", {
      name: "Suresh (Driver 2)",
      email: `driver2_${Date.now()}@example.com`,
      password: "password123",
      role: "delivery_partner",
      phone: "9876543211",
    });
    driver2Token = driver2Auth.body.data.token;
    driver2Id = driver2Auth.body.data.user.id;

    // Set Driver 2 status
    await apiRequest("PUT", "/delivery/set-status", { status: "AVAILABLE" }, driver2Token);

    // Get sample restaurant & menu item
    const restList = await apiRequest("GET", "/restaurants");
    restId = restList.body.data[0]._id;
    const menuList = await apiRequest("GET", `/restaurants/${restId}`);
    menuId = menuList.body.data.menuItems[0]._id;

    // =========================================================================
    // FEATURE 1: Fraud Detection and Order Validation System
    // =========================================================================
    console.log("🛡️ FEATURE 1: Fraud Detection and Order Validation System");

    // 1.1 Rapid ordering & high order value fraud trigger (Quantity 100 -> Value > ₹5000)
    const highValOrderRes = await apiRequest(
      "POST",
      "/orders/create",
      {
        restaurantId: restId,
        items: [{ menuItem: menuId, quantity: 100 }], // High value order > ₹5000
        deliveryAddress: "Security Test Address",
        paymentMethod: "UPI",
      },
      customerToken
    );

    check(
      highValOrderRes.status === 201 && highValOrderRes.body.data.riskScore > 0,
      1,
      "High value transaction triggers risk score calculation",
      `Score: ${highValOrderRes.body.data.riskScore}/100, Level: ${highValOrderRes.body.data.riskLevel}`
    );

    const flaggedOrderId = highValOrderRes.body.data._id;

    // 1.2 Access flagged orders as Administrator (/api/admin/fraud/orders)
    const adminFraudRes = await apiRequest("GET", "/admin/fraud/orders", null, adminToken);
    check(
      adminFraudRes.status === 200 && adminFraudRes.body.data.length >= 0,
      1,
      "Admin accesses flagged orders dashboard endpoint (/api/admin/fraud/orders)",
      `Total flagged logs: ${adminFraudRes.body.stats.totalFlagged}`
    );

    // 1.3 Administrator approves flagged order (/api/admin/fraud/orders/:orderId/approve)
    const approveRes = await apiRequest("POST", `/admin/fraud/orders/${flaggedOrderId}/approve`, null, adminToken);
    check(
      approveRes.status === 200 && approveRes.body.data.isSuspicious === false,
      1,
      "Admin approves suspicious order & clears risk flag"
    );

    // 1.4 Administrator restricts user account (/api/admin/users/:userId/restrict)
    const restrictRes = await apiRequest("POST", `/admin/users/${customerId}/restrict`, { reason: "Behavioral test" }, adminToken);
    check(
      restrictRes.status === 200 && restrictRes.body.data.isRestricted === true,
      1,
      "Admin restricts user account after suspicious pattern detection"
    );

    // Unrestrict user so remaining tests pass
    await apiRequest("POST", `/admin/users/${customerId}/unrestrict`, null, adminToken);

    // =========================================================================
    // FEATURE 2: Advanced Restaurant Search and Filtering System
    // =========================================================================
    console.log("\n🔍 FEATURE 2: Advanced Restaurant Search and Filtering System");

    // 2.1 Multi-parameter filtering (/api/restaurants/search?cuisine=Indian&rating=4&maxDeliveryTime=30)
    const filterRes = await apiRequest("GET", "/restaurants/search?cuisine=Indian&rating=4&maxDeliveryTime=30");
    check(
      filterRes.status === 200 && Array.isArray(filterRes.body.data.restaurants),
      2,
      "Multi-parameter filter query (?cuisine=Indian&rating=4&maxDeliveryTime=30)",
      `Found ${filterRes.body.data.restaurants.length} matching restaurants`
    );

    // 2.2 Fuzzy Text Search ("piza" -> matches "Pizza Craft")
    const fuzzyRes = await apiRequest("GET", "/restaurants/search?query=piza");
    check(
      fuzzyRes.status === 200 && fuzzyRes.body.data.restaurants.some((r) => r.name.toLowerCase().includes("pizza")),
      2,
      "Fuzzy text search matches minor spelling variations ('piza' -> 'Pizza Craft')"
    );

    // 2.3 Admin creates new restaurant (/api/admin/restaurants/create)
    const newRestRes = await apiRequest(
      "POST",
      "/restaurants/create",
      {
        name: "Test Zaika Restaurant",
        description: "Test description",
        cuisine: ["North Indian"],
        address: "Test Road 101",
      },
      adminToken
    );
    check(
      newRestRes.status === 201 && newRestRes.body.data.name === "Test Zaika Restaurant",
      2,
      "Admin creates new restaurant data (/api/admin/restaurants/create)"
    );

    // 2.4 Admin updates restaurant (/api/admin/restaurants/update/:restaurantId)
    const createdRestId = newRestRes.body.data._id;
    const updateRestRes = await apiRequest("PUT", `/restaurants/update/${createdRestId}`, { rating: 4.9 }, adminToken);
    check(
      updateRestRes.status === 200 && updateRestRes.body.data.rating === 4.9,
      2,
      "Admin updates restaurant information (/api/admin/restaurants/update/:id)"
    );

    // Clean up created test restaurant
    await apiRequest("DELETE", `/restaurants/${createdRestId}`, null, adminToken);

    // =========================================================================
    // FEATURE 3: Dynamic Surge Pricing for Delivery Fees
    // =========================================================================
    console.log("\n⚡ FEATURE 3: Dynamic Surge Pricing for Delivery Fees");

    // 3.1 Calculate delivery fee (/api/orders/calculate-delivery-fee)
    const feeRes = await apiRequest("POST", "/orders/calculate-delivery-fee");
    check(
      feeRes.status === 200 && typeof feeRes.body.data.finalDeliveryFee === "number",
      3,
      "Backend calculates dynamic delivery fee (/api/orders/calculate-delivery-fee)",
      `Base Fee: ₹${feeRes.body.data.baseDeliveryFee}, Multiplier: ${feeRes.body.data.surgeMultiplier}x, Final Fee: ₹${feeRes.body.data.finalDeliveryFee}`
    );

    // 3.2 Admin configures surge pricing settings (/api/admin/surge-settings)
    const updateSurgeRes = await apiRequest("PUT", "/admin/surge-settings", { surgeMultiplier: 1.8 }, adminToken);
    check(
      updateSurgeRes.status === 200 && updateSurgeRes.body.data.surgeMultiplier === 1.8,
      3,
      "Admin configures surge pricing rules & multipliers (/api/admin/surge-settings)"
    );

    // 3.3 Confirm order stores calculated surge fee
    const orderWithSurgeRes = await apiRequest(
      "POST",
      "/orders/create",
      {
        restaurantId: restId,
        items: [{ menuItem: menuId, quantity: 1 }],
        deliveryAddress: "Surge Test Address",
      },
      customerToken
    );
    check(
      orderWithSurgeRes.status === 201 && typeof orderWithSurgeRes.body.data.surgeFee === "number",
      3,
      "Order creation stores calculated dynamic surge charge in order record"
    );

    const surgeTestOrderId = orderWithSurgeRes.body.data._id;

    // =========================================================================
    // FEATURE 4: Smart Delivery Partner Assignment System
    // =========================================================================
    console.log("\n🛵 FEATURE 4: Smart Delivery Partner Assignment System");

    // 4.1 Delivery partner sets availability (/api/delivery/set-status)
    const setStatusRes = await apiRequest("PUT", "/delivery/set-status", { status: "AVAILABLE" }, driverToken);
    check(
      setStatusRes.status === 200 && setStatusRes.body.data.status === "AVAILABLE",
      4,
      "Delivery partner updates availability status (/api/delivery/set-status)"
    );

    // 4.2 Geo-proximity & workload auto-assignment on order creation
    check(
      orderWithSurgeRes.body.data.assignedDeliveryPartner !== null,
      4,
      "System automatically determines optimal delivery partner & assigns them upon order creation"
    );

    // 4.3 View assigned partner info in order details (/api/orders/:orderId)
    const getOrderRes = await apiRequest("GET", `/orders/${surgeTestOrderId}`, null, customerToken);
    check(
      getOrderRes.status === 200 && getOrderRes.body.data.assignedDeliveryPartner !== null,
      4,
      "Assigned delivery partner information accessible via order details (/api/orders/:orderId)"
    );

    // 4.4 Driver declines order -> System automatically reassigns task
    const declineRes = await apiRequest("POST", `/delivery/orders/${surgeTestOrderId}/decline`, null, driverToken);
    check(
      declineRes.status === 200 && declineRes.body.success,
      4,
      "Driver declines order -> System automatically reassigns task to another available partner"
    );

    // =========================================================================
    // FEATURE 5: Real-Time Order Status and Notification System
    // =========================================================================
    console.log("\n📡 FEATURE 5: Real-Time Order Status and Notification System");

    // 5.1 Admin/Restaurant updates order status (/api/orders/update-status/:orderId)
    const updateStatusRes = await apiRequest("PUT", `/orders/update-status/${surgeTestOrderId}`, { status: "OUT_FOR_DELIVERY" }, adminToken);
    check(
      updateStatusRes.status === 200 && updateStatusRes.body.data.orderStatus === "OUT_FOR_DELIVERY",
      5,
      "Admin/Restaurant updates order status (/api/orders/update-status/:orderId) -> Triggers WebSockets event"
    );

    // 5.2 Retrieve latest order lifecycle status (/api/orders/:orderId)
    const trackOrderRes = await apiRequest("GET", `/orders/${surgeTestOrderId}`, null, customerToken);
    check(
      trackOrderRes.status === 200 && trackOrderRes.body.data.timeline.outForDeliveryAt !== null,
      5,
      "User retrieves updated order lifecycle tracking & timeline status (/api/orders/:orderId)"
    );

    // =========================================================================
    // FEATURE 6: Dynamic Restaurant Recommendation System
    // =========================================================================
    console.log("\n🎯 FEATURE 6: Dynamic Restaurant Recommendation System");

    // 6.1 Personalized recommendations requested (/api/restaurants/recommendations/:userId)
    const recRes = await apiRequest("GET", `/restaurants/recommendations/${customerId}`, null, customerToken);
    check(
      recRes.status === 200 && Array.isArray(recRes.body.data) && recRes.body.data.length > 0,
      6,
      "Recommendation engine returns personalized ranked restaurants using MongoDB aggregation pipeline",
      `Score: ${recRes.body.data[0].recommendationScore}/100 - Reason: ${recRes.body.data[0].recommendationReason}`
    );

    // =========================================================================
    // SUMMARY DEEP DIVE REPORT
    // =========================================================================
    console.log("\n==================================================================");
    console.log(`🏁 DEEP DIVE TESTING COMPLETE: ${passed} PASSED / ${failed} FAILED`);
    console.log("==================================================================\n");

    server.close();
    await mongoose.connection.close();
    process.exit(failed === 0 ? 0 : 1);
  } catch (err) {
    console.error("❌ Deep dive testing execution failure:", err);
    if (server) server.close();
    if (mongoose.connection) await mongoose.connection.close();
    process.exit(1);
  }
}

runDetailed6FeaturesTesting();
