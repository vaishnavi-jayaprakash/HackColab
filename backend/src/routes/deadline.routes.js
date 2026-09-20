import express from "express";

import {
  createDeadline,
  getHackathonDeadlines,
  getDeadlineById,
  updateDeadline,
  deleteDeadline
} from "../controllers/deadline.controller.js";

import authenticate from "../middleware/auth.middleware.js";
import { requireDeadlineAccess, requireHackathonAccess } from "../middleware/team-access.middleware.js";

const router = express.Router();

router.post(
  "/hackathons/:hackathonId/deadlines",
  authenticate,
  requireHackathonAccess,
  createDeadline
);

router.get(
  "/hackathons/:hackathonId/deadlines",
  authenticate,
  requireHackathonAccess,
  getHackathonDeadlines
);

router.get(
  "/deadlines/:deadlineId",
  authenticate,
  requireDeadlineAccess,
  getDeadlineById
);

router.patch(
  "/deadlines/:deadlineId",
  authenticate,
  requireDeadlineAccess,
  updateDeadline
);

router.delete(
  "/deadlines/:deadlineId",
  authenticate,
  requireDeadlineAccess,
  deleteDeadline
);

export default router;
