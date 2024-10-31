import Notification from "../models/Notification.js";
import User from "../models/User.js";

export const createNotification = async (req, res) => {
  const { message, userIds } = req.body;

  if (!message || !Array.isArray(userIds) || userIds.length === 0) {
    return res
      .status(400)
      .json({ message: "Mensaje y lista de usuarios son requeridos" });
  }

  try {
    const newNotification = new Notification({ message, userIds });
    await newNotification.save();

    // Añadir la notificación a la lista de cada usuario
    await User.updateMany(
      { _id: { $in: userIds } },
      { $push: { notifications: newNotification._id } }
    );

    res.status(201).json({ message: "Notificación creada", newNotification });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al crear notificación", error: error.message });
  }
};

export const getUserNotifications = async (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ message: "ID de usuario requerido" });
  }

  try {
    const notifications = await Notification.find({ userIds: userId });
    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener notificaciones" });
  }
};

export const markNotificationsAsRead = async (req, res) => {
  const { notificationIds, userId } = req.body;

  if (
    !Array.isArray(notificationIds) ||
    notificationIds.length === 0 ||
    !userId
  ) {
    return res
      .status(400)
      .json({ message: "IDs de notificación y ID de usuario requeridos" });
  }

  try {
    await Notification.updateMany(
      { _id: { $in: notificationIds }, userIds: userId },
      { $set: { isRead: true } }
    );
    res.json({ message: "Notificaciones marcadas como leídas" });
  } catch (error) {
    res.status(500).json({
      message: "Error al marcar notificaciones",
      error: error.message,
    });
  }
};

export const markAllNotificationsAsRead = async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ message: "ID de usuario requerido" });
  }

  try {
    await Notification.updateMany(
      { userIds: userId, isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ message: "Todas las notificaciones marcadas como leídas" });
  } catch (error) {
    res.status(500).json({
      message: "Error al marcar todas las notificaciones",
      error: error.message,
    });
  }
};

export const deleteNotification = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "ID de usuario requerido" });
  }

  try {
    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ message: "Notificación no encontrada" });
    }

    await notification.remove();
    await User.updateMany(
      { notifications: id },
      { $pull: { notifications: id } }
    );

    res.json({ message: "Notificación eliminada" });
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar notificación",
      error: error.message,
    });
  }
};
