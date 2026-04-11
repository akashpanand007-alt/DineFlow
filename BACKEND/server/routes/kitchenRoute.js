import express from "express";
import {
  kitchenRegister,
  kitchenLogin,
  isKitchenAuth,
  kitchenLogout,
  changeKitchenPassword
} from "../controllers/kitchenController.js";


const router = express.Router();


router.post("/register", kitchenRegister);


router.post("/login", kitchenLogin);


router.get("/is-auth", isKitchenAuth);


router.post("/logout", kitchenLogout);


router.put("/change-password", changeKitchenPassword)

export default router;
