import express from "express";

import {
  detectConflicts,
  getRepositoryConflicts,
} from "../controllers/conflict.controller.js";

import authenticate from "../middleware/auth.middleware.js";
import { requireRepositoryAccess } from "../middleware/team-access.middleware.js";

const router = express.Router();

router.post(
  "/repositories/:repositoryId/conflicts/detect",
  authenticate,
  requireRepositoryAccess,
  detectConflicts
);

router.get(
  "/repositories/:repositoryId/conflicts",
  authenticate,
  requireRepositoryAccess,
  getRepositoryConflicts
);

export default router;
