import express from "express";

import {
  getTeamDashboard,
} from "../controllers/dashboard.controller.js";

import authenticate from "../middleware/auth.middleware.js";
import { requireTeamAccess } from "../middleware/team-access.middleware.js";

const router = express.Router();

router.get(
  "/teams/:teamId/dashboard",
  authenticate,
  requireTeamAccess,
  getTeamDashboard
);

export default router;
