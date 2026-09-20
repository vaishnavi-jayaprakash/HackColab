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

const router = express.Router();

router.post(
  "/teams/:teamId/repositories",
  authenticate,
  connectRepository
);

router.get(
  "/teams/:teamId/repositories",
  authenticate,
  getTeamRepositories
);

router.post(
  "/repositories/:repositoryId/sync",
  authenticate,
  syncRepository
);

router.post(
  "/repositories/:repositoryId/branches/:branchId/sync",
  authenticate,
  syncBranchActivity
);

router.post(
  "/repositories/:repositoryId/pull-requests/sync",
  authenticate,
  syncPullRequests
);

router.get(
  "/repositories/:repositoryId/pull-requests",
  authenticate,
  getRepositoryPullRequests
);

export default router;