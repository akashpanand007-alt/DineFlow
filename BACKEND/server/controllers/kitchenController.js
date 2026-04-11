import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Kitchen from "../models/Kitchen.js";
import {
  markKitchenOnline,
  markKitchenOffline
} from "../configs/socketServer.js";

// 1) Kitchen Register
export const kitchenRegister = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    const existingKitchen = await Kitchen.findOne({ email: normalizedEmail });
    if (existingKitchen) {
      return res
        .status(409)
        .json({ success: false, message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await Kitchen.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      status: "pending"
    });

    res.status(201).json({
      success: true,
      message: "Registered successfully — pending admin approval"
    });
  } catch (error) {

    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 2) Kitchen Login
export const kitchenLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    const kitchen = await Kitchen.findOne({ email: normalizedEmail }).select("+password");

    if (!kitchen) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    if (kitchen.status !== "approved") {
      return res
        .status(403)
        .json({ success: false, message: "Account not approved yet" });
    }

    const isMatch = await bcrypt.compare(password, kitchen.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: kitchen._id, email: kitchen.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("kitchenToken", token, {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  path: "/",
});

    // mark active
    markKitchenOnline(kitchen._id);

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      kitchen: {
        _id: kitchen._id,
        email: kitchen.email,
        status: kitchen.status
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 3) Auth check
export const isKitchenAuth = async (req, res) => {
  try {
    const token = req.cookies.kitchenToken;
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid token" });
      }
      res.status(200).json({ success: true, kitchen: decoded });
    });
  } catch (error) {
    
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 4) Logout
export const kitchenLogout = async (req, res) => {
  try {
    const token = req.cookies.kitchenToken;

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      markKitchenOffline(decoded.id);
    }

    res.clearCookie("kitchenToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite:
        process.env.NODE_ENV === "production" ? "none" : "strict"
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (error) {
    
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 5) Change Password
export const changeKitchenPassword = async (req, res) => {
  try {
    const token = req.cookies.kitchenToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token"
      });
    }

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters"
      });
    }

    if (oldPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password cannot be same as old password"
      });
    }

    const kitchen = await Kitchen.findById(decoded.id).select("+password");

    if (!kitchen) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, kitchen.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Old password incorrect"
      });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    kitchen.password = hashed;

    await kitchen.save();

    res.json({
      success: true,
      message: "Password updated successfully"
    });

  } catch (error) {
    
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};