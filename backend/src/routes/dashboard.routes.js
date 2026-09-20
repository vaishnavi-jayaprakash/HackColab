import express from "express";

import {
  getTeamDashboard,
} from "../controllers/dashboard.controller.js";

import authenticate from "../middleware/auth.middleware.js";

const router = express.Router();

router.get(
  "/teams/:teamId/dashboard",
  authenticate,
  getTeamDashboard
);

export default router;