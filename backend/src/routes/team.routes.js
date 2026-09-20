import express from "express";

import {
  createTeam,
  getTeamById,
  addTeamMember,
  getTeamMembers,
} from "../controllers/team.controller.js";

import authenticate from "../middleware/auth.middleware.js";

const router = express.Router();

router.post(
  "/hackathons/:hackathonId/teams",
  authenticate,
  createTeam
);

router.get(
  "/teams/:teamId",
  authenticate,
  getTeamById
);

router.post(
  "/teams/:teamId/members",
  authenticate,
  addTeamMember
);

router.get(
  "/teams/:teamId/members",
  authenticate,
  getTeamMembers
);

export default router;