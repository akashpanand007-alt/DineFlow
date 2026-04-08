import express from "express";
import authAdmin from "../middlewares/authAdmin.js";
import {
  adminAddProduct,
  adminDeleteProduct,
  adminGetProducts,
} from "../controllers/adminProductController.js";
import { uploadCloud } from "../configs/multer.js";

const router = express.Router();

/**
 * ===============================
 * GET ALL PRODUCTS
 * GET /api/admin/products
 * ===============================
 */
router.get(
  "/",
  authAdmin,
  adminGetProducts
);

// Admin adds a new product (images uploaded to Cloudinary)
router.post(
  "/add",
  authAdmin,
  uploadCloud.array("images", 10),
  adminAddProduct
);

// Admin deletes a product by ID
router.delete(
  "/delete/:productId",
  authAdmin,
  adminDeleteProduct
);

export default router;

