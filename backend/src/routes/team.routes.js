import express from "express";

import {
  createTeam,
  getTeamById,
  addTeamMember,
  inviteTeamMember,
  getTeamInvitations,
  removeTeamMember,
  deleteTeam,
  getTeamMembers,
} from "../controllers/team.controller.js";

import authenticate from "../middleware/auth.middleware.js";
import { requireTeamAccess } from "../middleware/team-access.middleware.js";

const router = express.Router();

router.post(
  "/hackathons/:hackathonId/teams",
  authenticate,
  createTeam
);

router.get(
  "/teams/:teamId",
  authenticate,
  requireTeamAccess,
  getTeamById
);

router.post(
  "/teams/:teamId/members",
  authenticate,
  requireTeamAccess,
  addTeamMember
);

router.get(
  "/teams/:teamId/members",
  authenticate,
  requireTeamAccess,
  getTeamMembers
);

router.post("/teams/:teamId/invitations", authenticate, requireTeamAccess, inviteTeamMember);
router.get("/teams/:teamId/invitations", authenticate, requireTeamAccess, getTeamInvitations);

router.delete(
  "/teams/:teamId/members/:userId",
  authenticate,
  requireTeamAccess,
  removeTeamMember
);

router.delete(
  "/teams/:teamId",
  authenticate,
  requireTeamAccess,
  deleteTeam
);

export default router;
