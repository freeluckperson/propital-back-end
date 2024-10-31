// src/controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const loginController = async (req, res) => {
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
};

export const registerController = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, username, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "User successfully registered" });
  } catch (err) {
    res.status(500).json({ message: "Registration error", error: err.message });
  }
};

export const grantAdminPrivileges = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Admin privileges required" });
    }

    const { id } = req.params;
    await User.findByIdAndUpdate(id, { isAdmin: true });
    res.json({ message: "User granted admin privileges" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error granting admin privileges", error: err.message });
  }
};

export const deleteUser = async (req, res) => {
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
};

export const protectedEndpoint = (req, res) => {
  res.json({ message: "Access to protected route", userId: req.user.userId });
};

export const logoutController = (_, res) => {
  res
    .clearCookie("token")
    .json({ message: "Logout successful, token removed" });
};
