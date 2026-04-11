import express from "express";
import authAdmin from "../middlewares/authAdmin.js";
import { addCategory, deleteCategory } from "../controllers/adminCategoryController.js";

const router = express.Router();

router.post("/", authAdmin, addCategory);             
router.delete("/:categoryId", authAdmin, deleteCategory);  

export default router;
