import express from "express";

import {
  createDeadline,
  getHackathonDeadlines,
  getDeadlineById,
  updateDeadline,
  deleteDeadline
} from "../controllers/deadline.controller.js";

import authenticate from "../middleware/auth.middleware.js";

const router = express.Router();

router.post(
  "/hackathons/:hackathonId/deadlines",
  authenticate,
  createDeadline
);

router.get(
  "/hackathons/:hackathonId/deadlines",
  authenticate,
  getHackathonDeadlines
);

router.get(
  "/deadlines/:deadlineId",
  authenticate,
  getDeadlineById
);

router.patch(
  "/deadlines/:deadlineId",
  authenticate,
  updateDeadline
);

router.delete(
  "/deadlines/:deadlineId",
  authenticate,
  deleteDeadline
);

export default router;