import express from "express";
import {
  kitchenRegister,
  kitchenLogin,
  isKitchenAuth,
  kitchenLogout,
  changeKitchenPassword
} from "../controllers/kitchenController.js";


const router = express.Router();

// Register (public)
router.post("/register", kitchenRegister);

// Login
router.post("/login", kitchenLogin);

// Check auth
router.get("/is-auth", isKitchenAuth);

// Logout
router.post("/logout", kitchenLogout);


router.put("/change-password", changeKitchenPassword)

export default router;
