import express from "express";

import {
  createSubmissionItem,
  getTeamSubmissionItems,
  updateSubmissionItem,
  deleteSubmissionItem,
} from "../controllers/submission.controller.js";

import authenticate from "../middleware/auth.middleware.js";
import { requireSubmissionAccess, requireTeamAccess } from "../middleware/team-access.middleware.js";

const router = express.Router();

router.post(
  "/teams/:teamId/submissions",
  authenticate,
  requireTeamAccess,
  createSubmissionItem
);

router.get(
  "/teams/:teamId/submissions",
  authenticate,
  requireTeamAccess,
  getTeamSubmissionItems
);

router.patch(
  "/submissions/:itemId",
  authenticate,
  requireSubmissionAccess,
  updateSubmissionItem
);

router.delete(
  "/submissions/:itemId",
  authenticate,
  requireSubmissionAccess,
  deleteSubmissionItem
);

export default router;
