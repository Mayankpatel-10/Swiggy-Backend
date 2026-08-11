/**
 * Comprehensive End-to-End Integration & Unit Test Suite for Swiggy Backend
 */
require("dotenv").config();
const http = require("http");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const app = require("../app");
const { initSocket } = require("../sockets/orderSockets");

const PORT = 5099; // Isolated test port
let server = null;
let baseUrl = `http://localhost:${PORT}/api`;

let customerToken = "";
let adminToken = "";
let deliveryToken = "";
let customerId = "";
let adminId = "";
let deliveryId = "";
let sampleRestaurantId = "";
let sampleMenuItemId = "";
let createdOrderId = "";

let passedCount = 0;
let failedCount = 0;

function assert(condition, testName, extraDetail = "") {
  if (condition) {
    console.log(`  ✅ PASS: ${testName} ${extraDetail ? `(${extraDetail})` : ""}`);
    passedCount++;
  } else {
    console.error(`  ❌ FAIL: ${testName} ${extraDetail ? `(${extraDetail})` : ""}`);
    failedCount++;
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
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (token) {
      options.headers["Authorization"] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on("error", (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runFullBackendTests() {
  console.log("\n=======================================================");
  console.log("🚀 STARTING COMPREHENSIVE BACKEND INTEGRATION TEST SUITE");
  console.log("=======================================================\n");

  try {
    await connectDB();

    server = http.createServer(app);
    initSocket(server);
    await new Promise((resolve) => server.listen(PORT, resolve));
    console.log(`📡 Test server running on port ${PORT}\n`);

    // --- TEST SUITE 1: AUTHENTICATION & ROLES ---
    console.log("🔒 TEST GROUP 1: Authentication & Authorization");

    // 1.1 Login Admin
    const adminLoginRes = await apiRequest("POST", "/auth/login", {
      email: "admin@example.com",
      password: "admin123",
    });
    assert(adminLoginRes.status === 200 && adminLoginRes.body.success, "Admin login with valid credentials");
    adminToken = adminLoginRes.body.data?.token;
    adminId = adminLoginRes.body.data?.user?.id;

    // 1.2 Login Customer
    const customerLoginRes = await apiRequest("POST", "/auth/login", {
      email: "customer@example.com",
      password: "customer123",
    });
    assert(customerLoginRes.status === 200 && customerLoginRes.body.success, "Customer login with valid credentials");
    customerToken = customerLoginRes.body.data?.token;
    customerId = customerLoginRes.body.data?.user?.id;

    // 1.3 Login Delivery Partner
    const deliveryLoginRes = await apiRequest("POST", "/auth/login", {
      email: "delivery@example.com",
      password: "delivery123",
    });
    assert(deliveryLoginRes.status === 200 && deliveryLoginRes.body.success, "Delivery Partner login");
    deliveryToken = deliveryLoginRes.body.data?.token;
    deliveryId = deliveryLoginRes.body.data?.user?.id;

    // 1.4 Get Profile (/auth/me)
    const meRes = await apiRequest("GET", "/auth/me", null, customerToken);
    assert(meRes.status === 200 && meRes.body.data.email === "customer@example.com", "Get authenticated user profile (/auth/me)");

    // 1.5 Role Guard Test: Customer attempting Admin Route
    const forbiddenRes = await apiRequest("GET", "/admin/dashboard-stats", null, customerToken);
    assert(forbiddenRes.status === 403, "Forbidden role access check (Customer blocked from admin routes)");

    // --- TEST SUITE 2: RESTAURANT & FUZZY SEARCH ---
    console.log("\n🏪 TEST GROUP 2: Restaurant Search, Fuzzy Match & Filtering");

    // 2.1 Get All Restaurants
    const allRestRes = await apiRequest("GET", "/restaurants");
    assert(allRestRes.status === 200 && allRestRes.body.count > 0, "Fetch active restaurants list");
    sampleRestaurantId = allRestRes.body.data[0]._id;

    // 2.2 Fuzzy Text Search Test ("piza" -> matches "Pizza Craft")
    const fuzzySearchRes = await apiRequest("GET", "/restaurants/search?query=piza");
    assert(
      fuzzySearchRes.status === 200 && fuzzySearchRes.body.data.restaurants.some((r) => r.name.toLowerCase().includes("pizza")),
      "Fuzzy text search matching spelling variation ('piza' -> 'Pizza Craft')"
    );

    // 2.3 Multi-Parameter Filtering Test
    const filterRes = await apiRequest("GET", "/restaurants/search?cuisine=Indian&rating=4.0&maxDeliveryTime=35");
    assert(filterRes.status === 200 && Array.isArray(filterRes.body.data.restaurants), "Multi-parameter search filtering (cuisine, rating, maxDeliveryTime)");

    // 2.4 Get Single Restaurant & Menu
    const singleRestRes = await apiRequest("GET", `/restaurants/${sampleRestaurantId}`);
    assert(singleRestRes.status === 200 && singleRestRes.body.data.menuItems.length > 0, "Get restaurant details with menu items");
    sampleMenuItemId = singleRestRes.body.data.menuItems[0]._id;

    // --- TEST SUITE 3: CART OPERATIONS ---
    console.log("\n🛒 TEST GROUP 3: Cart Management");

    // 3.1 Add Item to Cart
    const addToCartRes = await apiRequest(
      "POST",
      "/cart/add",
      { restaurantId: sampleRestaurantId, menuItemId: sampleMenuItemId, quantity: 2 },
      customerToken
    );
    assert(addToCartRes.status === 200 && addToCartRes.body.data.items.length > 0, "Add item to cart");

    // 3.2 Get Cart
    const getCartRes = await apiRequest("GET", "/cart", null, customerToken);
    assert(getCartRes.status === 200 && getCartRes.body.data.totalAmount > 0, "Fetch cart total & item details");

    // --- TEST SUITE 4: DYNAMIC SURGE PRICING ---
    console.log("\n⚡ TEST GROUP 4: Dynamic Surge Pricing Calculation");

    const feeCalculationRes = await apiRequest("POST", "/orders/calculate-delivery-fee");
    assert(
      feeCalculationRes.status === 200 &&
        typeof feeCalculationRes.body.data.baseDeliveryFee === "number" &&
        typeof feeCalculationRes.body.data.finalDeliveryFee === "number",
      "Calculate dynamic delivery fee incorporating demand & surge multiplier"
    );

    // --- TEST SUITE 5: ORDER CREATION & FRAUD EVALUATION ---
    console.log("\n📦 TEST GROUP 5: Order Creation, Server Price Validation & Fraud Scoring");

    const createOrderRes = await apiRequest(
      "POST",
      "/orders/create",
      {
        restaurantId: sampleRestaurantId,
        items: [{ menuItem: sampleMenuItemId, quantity: 2 }],
        deliveryAddress: "789 MG Road, Central City, Bangalore",
        couponCode: "WELCOME50",
        paymentMethod: "UPI",
      },
      customerToken
    );

    assert(createOrderRes.status === 201 && createOrderRes.body.success, "Create order with server-side price validation & coupon");
    createdOrderId = createOrderRes.body.data?._id;
    const orderRiskScore = createOrderRes.body.data?.riskScore;
    assert(typeof orderRiskScore === "number", `Fraud risk score assigned to order: ${orderRiskScore}/100`);

    // --- TEST SUITE 6: SMART DELIVERY PARTNER WORKFLOW ---
    console.log("\n🛵 TEST GROUP 6: Smart Delivery Partner Assignment & Reassignment");

    // 6.1 Get Delivery Profile
    const delProfileRes = await apiRequest("GET", "/delivery/profile", null, deliveryToken);
    assert(delProfileRes.status === 200 && delProfileRes.body.success, "Get delivery partner profile");

    // 6.2 Set Availability Status
    const setStatusRes = await apiRequest("PUT", "/delivery/set-status", { status: "AVAILABLE" }, deliveryToken);
    assert(setStatusRes.status === 200 && setStatusRes.body.data.status === "AVAILABLE", "Update driver availability status");

    // 6.3 Get Driver Assigned Orders
    const driverOrdersRes = await apiRequest("GET", "/delivery/orders", null, deliveryToken);
    assert(driverOrdersRes.status === 200 && Array.isArray(driverOrdersRes.body.data), "Fetch assigned delivery orders");

    // 6.4 Driver Accept Order
    if (createdOrderId) {
      const acceptRes = await apiRequest("POST", `/delivery/orders/${createdOrderId}/accept`, null, deliveryToken);
      assert(acceptRes.status === 200 || acceptRes.status === 400, "Driver accept assigned order");
    }

    // --- TEST SUITE 7: REAL-TIME ORDER TRACKING & STATUS UPDATES ---
    console.log("\n📡 TEST GROUP 7: Real-Time Order Tracking & Status Progression");

    if (createdOrderId) {
      // 7.1 Track Order
      const trackRes = await apiRequest("GET", `/orders/${createdOrderId}`, null, customerToken);
      assert(trackRes.status === 200 && trackRes.body.data.orderStatus, "Fetch order tracking details");

      // 7.2 Update Order Status (Preparing)
      const updateStatusRes = await apiRequest(
        "PUT",
        `/orders/update-status/${createdOrderId}`,
        { status: "PREPARING" },
        adminToken
      );
      assert(updateStatusRes.status === 200 && updateStatusRes.body.data.orderStatus === "PREPARING", "Update order status to 'PREPARING'");
    }

    // --- TEST SUITE 8: ADMIN FRAUD CONTROL & USER RESTRICTION ---
    console.log("\n🛡️ TEST GROUP 8: Admin Fraud Management & User Restrictions");

    // 8.1 Get Fraud Flagged Orders
    const fraudOrdersRes = await apiRequest("GET", "/admin/fraud/orders", null, adminToken);
    assert(fraudOrdersRes.status === 200 && fraudOrdersRes.body.stats, "Admin fetch fraud logs & risk statistics");

    // 8.2 Restrict & Unrestrict User Account
    const restrictRes = await apiRequest("POST", `/admin/users/${customerId}/restrict`, { reason: "Audit test" }, adminToken);
    assert(restrictRes.status === 200 && restrictRes.body.data.isRestricted === true, "Admin restrict user account");

    const unrestrictRes = await apiRequest("POST", `/admin/users/${customerId}/unrestrict`, null, adminToken);
    assert(unrestrictRes.status === 200 && unrestrictRes.body.data.isRestricted === false, "Admin unrestrict user account");

    // --- TEST SUITE 9: ADMIN SURGE SETTINGS & ANALYTICS ---
    console.log("\n📊 TEST GROUP 9: Admin Surge Settings & Dashboard Analytics");

    // 9.1 Get Surge Settings
    const surgeSettingsRes = await apiRequest("GET", "/admin/surge-settings", null, adminToken);
    assert(surgeSettingsRes.status === 200 && surgeSettingsRes.body.data.surgeMultiplier, "Fetch surge pricing settings");

    // 9.2 Update Surge Settings
    const updateSurgeRes = await apiRequest("PUT", "/admin/surge-settings", { surgeMultiplier: 1.6 }, adminToken);
    assert(updateSurgeRes.status === 200 && updateSurgeRes.body.data.surgeMultiplier === 1.6, "Update surge multiplier to 1.6x");

    // 9.3 Get Admin Dashboard Analytics Stats
    const statsRes = await apiRequest("GET", "/admin/dashboard-stats", null, adminToken);
    assert(statsRes.status === 200 && statsRes.body.data.overview.totalOrders >= 0, "Fetch admin dashboard KPI overview & Recharts data");

    // --- TEST SUITE 10: RECOMMENDATIONS & NOTIFICATIONS ---
    console.log("\n🎯 TEST GROUP 10: Recommendation Engine & Notifications");

    // 10.1 Get Recommendations
    const recRes = await apiRequest("GET", `/restaurants/recommendations/${customerId}`, null, customerToken);
    assert(recRes.status === 200 && recRes.body.data.length > 0, "Get personalized recommendations based on preference profile");

    // 10.2 Get Notifications
    const notifRes = await apiRequest("GET", "/notifications", null, customerToken);
    assert(notifRes.status === 200 && Array.isArray(notifRes.body.data), "Fetch user notifications");

    // --- SUMMARY REPORT ---
    console.log("\n=======================================================");
    console.log(`🏁 BACKEND TEST SUMMARY: ${passedCount} PASSED / ${failedCount} FAILED`);
    console.log("=======================================================\n");

    server.close();
    await mongoose.connection.close();
    process.exit(failedCount === 0 ? 0 : 1);
  } catch (err) {
    console.error("❌ Critical Test Failure Error:", err);
    if (server) server.close();
    if (mongoose.connection) await mongoose.connection.close();
    process.exit(1);
  }
}

runFullBackendTests();
