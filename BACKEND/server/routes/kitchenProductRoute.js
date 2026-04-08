import express from "express";
import authKitchen from "../middlewares/authKitchen.js";
import { updateKitchenStock } from "../controllers/kitchenProductController.js";

const router = express.Router();

router.post("/update-stock", authKitchen, updateKitchenStock);  // POST /api/kitchen/products/update-stock

export default router;
