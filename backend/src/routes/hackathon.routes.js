import express from "express";

import {
  createHackathon,
  getHackathons,
  getHackathonById,
} from "../controllers/hackathon.controller.js";

import authenticate from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", authenticate, createHackathon);

router.get("/", authenticate, getHackathons);

router.get("/:id", authenticate, getHackathonById);

export default router;