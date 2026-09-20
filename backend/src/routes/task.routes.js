import express from "express";

import {
  createTask,
  getTeamTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from "../controllers/task.controller.js";

import authenticate from "../middleware/auth.middleware.js";

const router = express.Router();

// Team tasks
router.post(
  "/teams/:teamId/tasks",
  authenticate,
  createTask
);

router.get(
  "/teams/:teamId/tasks",
  authenticate,
  getTeamTasks
);

// Individual task
router.get(
  "/tasks/:taskId",
  authenticate,
  getTaskById
);

router.patch(
  "/tasks/:taskId",
  authenticate,
  updateTask
);

router.delete(
  "/tasks/:taskId",
  authenticate,
  deleteTask
);

export default router;