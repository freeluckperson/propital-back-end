import express from "express";
import "dotenv/config";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import initializeServer from "./server.js";
import User from "./models/User.js";
import Notification from "./models/Notification.js";
import authenticateToken from "./middlewares/authMiddleware.js";
import authRoutes from "./routes/authRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

export const app = express();
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));
app.use(morgan("dev"));
app.use(cookieParser());

app.use(authRoutes);
app.use(notificationRoutes);

initializeServer();
