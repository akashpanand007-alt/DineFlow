import express from "express";
import { uploadCloud } from "../configs/multer.js";
import authAdmin from "../middlewares/authAdmin.js";
import authKitchen from "../middlewares/authKitchen.js";

import {
  productList,
  productById,
} from "../controllers/productController.js";

import {
  adminAddProduct,
  adminDeleteProduct
} from "../controllers/adminProductController.js";

import {
  updateKitchenStock
} from "../controllers/kitchenProductController.js";

const productRouter = express.Router();


productRouter.post(
  "/add",
  authAdmin,
  uploadCloud.array("images", 10),
  adminAddProduct
);

// Admin deletes a product
productRouter.delete(
  "/delete/:productId",
  authAdmin,
  adminDeleteProduct
);



// Kitchen updates product stock/availability
productRouter.post(
  "/update-stock",
  authKitchen,
  updateKitchenStock
);


productRouter.get("/list", productList);

// Get single product by ID
productRouter.get("/id/:productId", productById);

export default productRouter;

