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


router.post(
  "/add",
  authAdmin,
  uploadCloud.array("images", 10),
  adminAddProduct
);


router.delete(
  "/delete/:productId",
  authAdmin,
  adminDeleteProduct
);

export default router;

