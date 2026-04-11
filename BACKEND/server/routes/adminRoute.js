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


router.post("/login", adminLogin);



router.get("/is-auth", authAdmin, isAdminAuth);


router.get("/me", authAdmin, isAdminAuth);


router.post("/logout", adminLogout);

router.put("/change-password", authAdmin, changeAdminPassword);


router.get("/kitchens/pending", authAdmin, getPendingKitchens);


router.post("/kitchens/approve", authAdmin, approveKitchen);


router.post("/kitchens/reject", authAdmin, rejectKitchen);


router.post("/kitchens/deactivate", authAdmin, deactivateKitchen);

router.post("/kitchens/delete", authAdmin, deleteKitchen);


router.get("/dashboard", authAdmin, getDashboardData);

router.get("/dashboard-debug", debugDashboardData); 

export default router;