// src/routes/notificationRoutes.js
import express from "express";
import {
  createNotification,
  deleteNotification,
  getUserNotifications,
  markAllNotificationsAsRead,
  markNotificationsAsRead,
} from "../controllers/notificationController.js";

const router = express.Router();

router.post("/notifications", createNotification);
router.get("/my-notifications", getUserNotifications);
router.put("/notifications/read", markNotificationsAsRead);
router.put("/notifications/read", markNotificationsAsRead);
router.put("/my-notifications/read-all", markAllNotificationsAsRead);
router.delete("/notifications/:id", deleteNotification);

export default router;
