import express from "express";
import {
  getPendingKitchens,
  approveKitchen,
  rejectKitchen,
} from "../controllers/adminKitchenController.js";
import authAdmin from "../middlewares/authAdmin.js";
import Kitchen from "../models/Kitchen.js";

const router = express.Router();

/**
 * ===============================
 * GET ALL KITCHENS
 * Used by AdminKitchens page
 * ===============================
 */
router.get("/", authAdmin, async (req, res, next) => {
  try {
    const kitchens = await Kitchen.find()
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      kitchens,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * ===============================
 * GET PENDING KITCHENS
 * ===============================
 */
router.get("/pending", authAdmin, getPendingKitchens);

/**
 * ===============================
 * APPROVE KITCHEN
 * ===============================
 */
router.post("/approve", authAdmin, approveKitchen);

/**
 * ===============================
 * REJECT KITCHEN
 * ===============================
 */
router.post("/reject", authAdmin, rejectKitchen);

/**
 * ===============================
 * DEACTIVATE KITCHEN
 * ===============================
 */
router.patch("/deactivate", authAdmin, async (req, res, next) => {
  try {
    const { kitchenId } = req.body;

    const kitchen = await Kitchen.findByIdAndUpdate(
      kitchenId,
      { status: "deactivated" },
      { new: true }
    );

    if (!kitchen) {
      return res
        .status(404)
        .json({ success: false, message: "Kitchen not found" });
    }

    req.app.get("io").emit("kitchen_updated", kitchen);

    res.json({ success: true, kitchen });
  } catch (err) {
    next(err);
  }
});

/**
 * ===============================
 * REACTIVATE KITCHEN
 * ===============================
 */
router.patch("/reactivate", authAdmin, async (req, res, next) => {
  try {
    const { kitchenId } = req.body;

    const kitchen = await Kitchen.findByIdAndUpdate(
      kitchenId,
      { status: "approved" },
      { new: true }
    );

    if (!kitchen) {
      return res
        .status(404)
        .json({ success: false, message: "Kitchen not found" });
    }

    req.app.get("io").emit("kitchen_updated", kitchen);

    res.json({ success: true, kitchen });
  } catch (err) {
    next(err);
  }
});

/**
 * ===============================
 * DELETE KITCHEN
 * ===============================
 */
router.delete("/:id", authAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    const kitchen = await Kitchen.findByIdAndDelete(id);

    if (!kitchen) {
      return res
        .status(404)
        .json({ success: false, message: "Kitchen not found" });
    }

    req.app.get("io").emit("kitchen_deleted", id);

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;


