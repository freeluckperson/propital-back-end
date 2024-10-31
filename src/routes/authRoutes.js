// src/routes/authRoutes.js
import express from "express";
import { validate } from "../middlewares/validationMiddleware.js";
import { loginSchema, registerSchema } from "../validators/authSchemas.js";
import {
  deleteUser,
  grantAdminPrivileges,
  loginController,
  logoutController,
  protectedEndpoint,
  registerController,
} from "../controllers/authController.js";
import authenticateToken from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/login", validate(loginSchema), loginController);
router.post("/register", validate(registerSchema), registerController);
router.put("/grant-admin/:id", authenticateToken, grantAdminPrivileges);
router.delete("/users/:id", authenticateToken, deleteUser);
router.get("/protected", authenticateToken, protectedEndpoint);
router.post("/logout", logoutController);

export default router;
