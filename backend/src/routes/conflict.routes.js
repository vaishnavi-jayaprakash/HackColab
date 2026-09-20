import express from "express";

import {
  detectConflicts,
  getRepositoryConflicts,
} from "../controllers/conflict.controller.js";

import authenticate from "../middleware/auth.middleware.js";

const router = express.Router();

router.post(
  "/repositories/:repositoryId/conflicts/detect",
  authenticate,
  detectConflicts
);

router.get(
  "/repositories/:repositoryId/conflicts",
  authenticate,
  getRepositoryConflicts
);

export default router;