import express from "express";

import {
  connectRepository,
  getTeamRepositories,
  syncRepository,
  syncBranchActivity,
  syncPullRequests,
  getRepositoryPullRequests
} from "../controllers/repository.controller.js";

import authenticate from "../middleware/auth.middleware.js";
import { requireRepositoryAccess, requireTeamAccess } from "../middleware/team-access.middleware.js";

const router = express.Router();

router.post(
  "/teams/:teamId/repositories",
  authenticate,
  requireTeamAccess,
  connectRepository
);

router.get(
  "/teams/:teamId/repositories",
  authenticate,
  requireTeamAccess,
  getTeamRepositories
);

router.post(
  "/repositories/:repositoryId/sync",
  authenticate,
  requireRepositoryAccess,
  syncRepository
);

router.post(
  "/repositories/:repositoryId/branches/:branchId/sync",
  authenticate,
  requireRepositoryAccess,
  syncBranchActivity
);

router.post(
  "/repositories/:repositoryId/pull-requests/sync",
  authenticate,
  requireRepositoryAccess,
  syncPullRequests
);

router.get(
  "/repositories/:repositoryId/pull-requests",
  authenticate,
  requireRepositoryAccess,
  getRepositoryPullRequests
);

export default router;
