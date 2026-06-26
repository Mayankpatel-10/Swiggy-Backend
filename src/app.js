const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const restaurantRoutes = require("./routes/restaurantRoute");
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/menu", require("./routes/menuRoute"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/admin", require("./routes/AdminRoutes"));

app.get("/", (req, res) => {
    res.status(200).json({ success: true, message: "Welcome to Swiggy API" });
});

module.exports = app;
