const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const restaurantRoutes = require("./routes/restaurantRoute");
const menuRoutes = require("./routes/menuRoute");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const deliveryRoutes = require("./routes/deliveryRoutes");
const adminRoutes = require("./routes/AdminRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  })
);
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/restaurants", recommendationRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);

// Root API Health & Directory Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 Swiggy Food Delivery Platform Backend API Server is Live",
    version: "1.0.0",
    status: "Operational",
    endpoints: {
      auth: "/api/auth",
      restaurants: "/api/restaurants",
      search: "/api/restaurants/search",
      orders: "/api/orders",
      delivery: "/api/delivery",
      admin: "/api/admin",
      notifications: "/api/notifications",
      surgePricing: "/api/orders/calculate-delivery-fee",
      recommendations: "/api/restaurants/recommendations/:userId",
      fraudMonitoring: "/api/admin/fraud/orders",
    },
  });
});

app.get("/api-status", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Swiggy Food Delivery Platform API is fully operational",
    version: "1.0.0",
  });
});

// 404 Fallback for Undefined API Routes
app.use((req, res, next) => {
  if (req.method === "GET" || req.method === "POST" || req.method === "PUT" || req.method === "DELETE") {
    return res.status(404).json({
      success: false,
      message: `API Route '${req.originalUrl}' not found on Swiggy Backend Server`,
    });
  }
  next();
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("[ServerError]", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;
