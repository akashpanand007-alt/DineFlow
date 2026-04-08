import express from "express";
import authAdmin from "../middlewares/authAdmin.js";
import { addCategory, deleteCategory } from "../controllers/adminCategoryController.js";

const router = express.Router();

router.post("/", authAdmin, addCategory);             // POST /api/admin/categories
router.delete("/:categoryId", authAdmin, deleteCategory);  // DELETE /api/admin/categories/:categoryId

export default router;
