import express from "express";
import authAdmin from "../middlewares/authAdmin.js";
import {
  createAdmin,
  adminLogin,
  adminLogout,
  changeAdminPassword,
  isAdminAuth,
} from "../controllers/adminController.js";
import {
  getPendingKitchens,
  approveKitchen,
  rejectKitchen,
  deactivateKitchen,
  deleteKitchen,
} from "../controllers/adminKitchenController.js";
import { getDashboardData, debugDashboardData } from "../controllers/adminDashboardController.js";


const router = express.Router();

/**
* =========================
*  Admin Authentication
* =========================
*/

router.post("/create", createAdmin);
// Admin login
// POST /api/admin/login
router.post("/login", adminLogin);

// Check if admin is logged in / authenticated
// GET /api/admin/is-auth
router.get("/is-auth", authAdmin, isAdminAuth);

// Alias for frontend compatibility
// GET /api/admin/me
router.get("/me", authAdmin, isAdminAuth);

// Admin logout
// POST /api/admin/logout
router.post("/logout", adminLogout);

router.put("/change-password", authAdmin, changeAdminPassword);

/**
 * =========================
 *  Kitchen Account Approval
 * =========================
 */

// Get all pending kitchen registrations
// GET /api/admin/kitchens/pending
router.get("/kitchens/pending", authAdmin, getPendingKitchens);

// Approve a kitchen account
// POST /api/admin/kitchens/approve
router.post("/kitchens/approve", authAdmin, approveKitchen);

// Reject a kitchen account
// POST /api/admin/kitchens/reject
router.post("/kitchens/reject", authAdmin, rejectKitchen);

// POST /api/admin/kitchens/deactivate
router.post("/kitchens/deactivate", authAdmin, deactivateKitchen);

// POST /api/admin/kitchens/delete
router.post("/kitchens/delete", authAdmin, deleteKitchen);

/**
 * =========================
 *  Admin Dashboard Metrics
 * =========================
 */

// GET /api/admin/dashboard
router.get("/dashboard", authAdmin, getDashboardData);

router.get("/dashboard-debug", debugDashboardData); 

export default router;