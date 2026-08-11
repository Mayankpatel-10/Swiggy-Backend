const Notification = require("../models/Notification");
const { getIO } = require("../sockets/orderSockets");

async function sendNotification({ userId, title, message, type = "ORDER_UPDATE", link = "" }) {
  try {
    const notification = await Notification.create({
      user: userId,
      title,
      message,
      type,
      link,
    });

    const io = getIO();
    if (io) {
      io.to(`user_${userId}`).emit("notification:new", notification);
    }

    return notification;
  } catch (err) {
    console.error("[NotificationService] Error sending notification:", err.message);
  }
}

async function getUserNotifications(userId) {
  return await Notification.find({ user: userId }).sort({ createdAt: -1 }).limit(20);
}

async function markNotificationsAsRead(userId) {
  return await Notification.updateMany({ user: userId, isRead: false }, { isRead: true });
}

module.exports = {
  sendNotification,
  getUserNotifications,
  markNotificationsAsRead,
};
