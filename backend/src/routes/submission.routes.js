import express from "express";

import {
  createSubmissionItem,
  getTeamSubmissionItems,
  updateSubmissionItem,
  deleteSubmissionItem,
} from "../controllers/submission.controller.js";

import authenticate from "../middleware/auth.middleware.js";

const router = express.Router();

router.post(
  "/teams/:teamId/submissions",
  authenticate,
  createSubmissionItem
);

router.get(
  "/teams/:teamId/submissions",
  authenticate,
  getTeamSubmissionItems
);

router.patch(
  "/submissions/:itemId",
  authenticate,
  updateSubmissionItem
);

router.delete(
  "/submissions/:itemId",
  authenticate,
  deleteSubmissionItem
);

export default router;