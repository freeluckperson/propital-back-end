import express from "express";
import "dotenv/config";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import initializeServer from "./server.js";
import { loginSchema, registerSchema } from "./validators/authSchemas.js";
import { validate } from "./middlewares/validationMiddleware.js";
import User from "./models/User.js";
import Notification from "./models/Notification.js";
import authenticateToken from "./middlewares/authMiddleware.js";

export const app = express();
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));
app.use(morgan("dev"));
app.use(cookieParser());

initializeServer();

// Registration endpoint
app.post("/register", validate(registerSchema), async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, username, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "User successfully registered" });
  } catch (err) {
    res.status(500).json({ message: "Registration error", error: err.message });
  }
});

// Login endpoint
app.post("/login", validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, isDeleted: false });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 3600000,
      })
      .json({
        message: "Login successful",
        id: user._id,
        isAdmin: user.isAdmin,
      });
  } catch (err) {
    res.status(500).json({ message: "Login error", error: err.message });
  }
});

// Endpoint for admin to grant admin privileges to other users
app.put("/grant-admin/:id", authenticateToken, async (req, res) => {
  if (!req.user.isAdmin)
    return res.status(403).json({ message: "Admin privileges required" });
  const { id } = req.params;
  await User.findByIdAndUpdate(id, { isAdmin: true });
  res.json({ message: "User granted admin privileges" });
});

// Logical delete endpoint for users
app.delete("/users/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted", user });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting user", error: err.message });
  }
});

// Example protected endpoint
app.get("/protected", authenticateToken, (req, res) => {
  res.json({ message: "Access to protected route", userId: req.user.userId });
});

// Logout endpoint
app.post("/logout", (_, res) => {
  res
    .clearCookie("token")
    .json({ message: "Logout successful, token removed" });
});

app.post("/notifications", async (req, res) => {
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
});

//====================================================
// 3. **GET /my-notifications**
//    - **Función**: Ver todas las notificaciones propias.

app.get("/my-notifications", async (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ message: "ID de usuario requerido" });
  }

  try {
    const notifications = await Notification.find({
      userIds: userId,
    });
    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener notificaciones" });
  }
});

//====================================================
// 4. **PUT /notifications/read**
//    - **Función**: Marcar una o varias notificaciones como leídas.

app.put("/notifications/read", async (req, res) => {
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
});

//====================================================
// 5. **PUT /my-notifications/read-all**
//    - **Función**: Marcar todas las notificaciones del usuario como leídas.

app.put("/my-notifications/read-all", async (req, res) => {
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
});

//====================================================
// 6. **DELETE /notifications/:id**
//    - **Función**: Eliminar una notificación específica.

app.delete("/notifications/:id", async (req, res) => {
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
});
//====================================================
