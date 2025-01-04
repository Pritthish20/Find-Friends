import express from "express";
import { logIn, signUp,logOut } from "../controllers/authController.js";

import {
    authenticate,
  } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/signup", signUp);
router.post("/login", logIn);
router.post("/logout", logOut);

export default router;