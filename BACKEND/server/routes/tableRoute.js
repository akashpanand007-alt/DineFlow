import express from "express";
import {
  createTable,
  toggleTableStatus
} from "../controllers/tableController.js";
import authAdmin from "../middlewares/authAdmin.js";
import Table from "../models/Table.js";

const router = express.Router();

/**
 * GET ALL TABLES
 * Protected: Admin only
 * Used by: AdminTables page
 */
router.get("/", authAdmin, async (req, res, next) => {
  try {
    const tables = await Table.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      tables
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET TABLE BY ID
 * Public access (needed for QR Code Menu scanning)
 * Used by: Customer Menu Page
 */
router.get("/:id", async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);

    if (!table) {
      return res.status(404).json({
        success: false,
        message: "Table not found"
      });
    }

    res.json({
      success: true,
      table
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch table"
    });
  }
});

/**
 * CREATE TABLE
 * Protected: Admin only
 */
router.post("/", authAdmin, createTable);

/**
 * TOGGLE TABLE STATUS
 * Protected: Admin only
 */
router.patch("/toggle", authAdmin, toggleTableStatus);

/**
 * DELETE TABLE
 * Protected: Admin only
 */
router.delete("/:id", authAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    const table = await Table.findByIdAndDelete(id);

    if (!table) {
      return res
        .status(404)
        .json({ success: false, message: "Table not found" });
    }

    
    req.app.get("io").emit("table_deleted", id);

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
