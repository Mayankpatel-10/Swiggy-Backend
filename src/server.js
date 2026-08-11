require("dotenv").config();
const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");
const { initSocket } = require("./sockets/orderSockets");

const PORT = process.env.PORT || 5000;

connectDB();

const server = http.createServer(app);

// Initialize Socket.IO with HTTP server
initSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 Swiggy Food Delivery Platform Server running on port ${PORT}`);
});