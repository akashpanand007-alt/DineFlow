import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Product from "../models/product.js";
import Admin from "../models/Admin.js";
/**
 * Admin Login
 * POST /api/admin/auth/login
 */
export const createAdmin = async (req, res) => {
  try {
    const apiKey = req.headers["x-api-key"];

    if (!apiKey || apiKey !== process.env.ADMIN_CREATE_KEY) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields required"
      });
    }

    const existing = await Admin.findOne({ email });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Admin already exists"
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      name,
      email,
      password: hashed
    });

    res.status(201).json({
      success: true,
      message: "Admin created successfully",
      admin: {
        _id: admin._id,
        email: admin.email
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email }).select("+password");

    if (!admin) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin._id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("adminToken", token, {
  httpOnly: true,
  secure: true,        
  sameSite: "none",    
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

    res.json({
      success: true,
      message: "Login successful",
      admin: {
        _id: admin._id,
        email: admin.email,
      },
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Admin Logout
 */
export const adminLogout = (req, res) => {
  res.clearCookie("adminToken", {
  httpOnly: true,
  secure: true,
  sameSite: "none",
});
  return res.json({ success: true, message: "Admin logged out" });
};

export const adminAddProduct = async (req, res) => {
  try {
    const { name, description, category, basePrice, variants } = req.body;
    if (!name || !category || !basePrice) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const newProduct = new Product({
      name,
      description,
      category,
      basePrice,
      variants,
      images: req.files ? req.files.map((f) => ({ url: f.path, public_id: f.filename })) : []
    });

    await newProduct.save();
    res.status(201).json({ success: true, product: newProduct });
  } catch (error) {

    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const adminDeleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const deleted = await Product.findByIdAndDelete(productId);
    if (!deleted) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};



/**
 * Check Admin Auth
 */
export const isAdminAuth = (req, res) => {
  return res.json({
    success: true,
    admin: req.admin,
  });
};


export const changeAdminPassword = async (req, res) => {
  try {
    const token = req.cookies.adminToken;

    if (!token) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { oldPassword, newPassword } = req.body;

    const admin = await Admin.findById(decoded.id).select("+password");

    const isMatch = await bcrypt.compare(oldPassword, admin.password);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Old password incorrect" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    admin.password = hashed;
    await admin.save();

    res.json({ success: true, message: "Password updated successfully" });

  } catch (error) {

    res.status(500).json({ success: false, message: "Server error" });
  }
};