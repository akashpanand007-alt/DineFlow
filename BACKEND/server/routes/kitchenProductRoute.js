import express from "express";
import authKitchen from "../middlewares/authKitchen.js";
import { updateKitchenStock } from "../controllers/kitchenProductController.js";

const router = express.Router();

router.post("/update-stock", authKitchen, updateKitchenStock);  

export default router;
