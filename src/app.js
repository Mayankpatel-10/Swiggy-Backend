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

app.use(cors());
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

// Serve Frontend Static Build in Production / Integrated Mode
const clientDistPath = path.join(__dirname, "../client/dist");
app.use(express.static(clientDistPath));

app.get("/api-status", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Swiggy Food Delivery Platform API is fully operational",
    version: "1.0.0",
  });
});

// Fallback to Index.html for Single Page React App (Express 5.x compatible syntax)
app.use((req, res, next) => {
  if (req.method === "GET" && !req.path.startsWith("/api")) {
    return res.sendFile(path.join(clientDistPath, "index.html"), (err) => {
      if (err) {
        return res.status(200).json({
          success: true,
          message: "Swiggy API Server Running. (Build client app with 'npm run build' inside client/)",
        });
      }
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
