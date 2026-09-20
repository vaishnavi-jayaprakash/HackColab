import express from "express";

import {
  createTask,
  getTeamTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from "../controllers/task.controller.js";

import authenticate from "../middleware/auth.middleware.js";
import { requireTaskAccess, requireTeamAccess } from "../middleware/team-access.middleware.js";

const router = express.Router();

// Team tasks
router.post(
  "/teams/:teamId/tasks",
  authenticate,
  requireTeamAccess,
  createTask
);

router.get(
  "/teams/:teamId/tasks",
  authenticate,
  requireTeamAccess,
  getTeamTasks
);

// Individual task
router.get(
  "/tasks/:taskId",
  authenticate,
  requireTaskAccess,
  getTaskById
);

router.patch(
  "/tasks/:taskId",
  authenticate,
  requireTaskAccess,
  updateTask
);

router.delete(
  "/tasks/:taskId",
  authenticate,
  requireTaskAccess,
  deleteTask
);

export default router;
