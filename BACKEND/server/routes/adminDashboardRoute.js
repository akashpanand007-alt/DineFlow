import express from "express";
import { getDashboardData } from "../controllers/adminDashboardController.js";
import authAdmin from "../middlewares/authAdmin.js";

const router = express.Router();

router.get("/dashboard", authAdmin, getDashboardData);

export default router;
