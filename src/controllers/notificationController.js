const notificationService = require("../services/notificationService");

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await notificationService.getUserNotifications(req.user._id);
    return res.status(200).json({ success: true, count: notifications.length, data: notifications });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.markRead = async (req, res) => {
  try {
    await notificationService.markNotificationsAsRead(req.user._id);
    return res.status(200).json({ success: true, message: "Notifications marked as read" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
