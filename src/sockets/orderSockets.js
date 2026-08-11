const { Server } = require("socket.io");

let io = null;

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Join room for specific user notifications
    socket.on("join:user", (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
        console.log(`[Socket.IO] Socket ${socket.id} joined user room: user_${userId}`);
      }
    });

    // Join room for specific order live tracking
    socket.on("join:order", (orderId) => {
      if (orderId) {
        socket.join(`order_${orderId}`);
        console.log(`[Socket.IO] Socket ${socket.id} joined order tracking room: order_${orderId}`);
      }
    });

    // Join room for admin alerts
    socket.on("join:admin", () => {
      socket.join("admin_room");
      console.log(`[Socket.IO] Socket ${socket.id} joined admin room`);
    });

    socket.on("disconnect", () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    console.warn("[Socket.IO] Server instance not initialized yet.");
  }
  return io;
}

function emitOrderStatusUpdate(orderId, orderData) {
  if (io) {
    io.to(`order_${orderId}`).emit("order:status_updated", orderData);
    io.to(`user_${orderData.user}`).emit("order:status_updated", orderData);
  }
}

function emitFraudAlert(fraudData) {
  if (io) {
    io.to("admin_room").emit("fraud:flagged", fraudData);
  }
}

module.exports = {
  initSocket,
  getIO,
  emitOrderStatusUpdate,
  emitFraudAlert,
};
