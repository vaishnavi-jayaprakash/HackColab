import express from "express";
import multer from "multer";

import {
  uploadFile,
  getTeamFiles,
  deleteFile,
} from "../controllers/upload.controller.js";

import authenticate from "../middleware/auth.middleware.js";
import { requireTeamAccess, requireUploadAccess } from "../middleware/team-access.middleware.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});

router.post(
  "/teams/:teamId/uploads",
  authenticate,
  requireTeamAccess,
  upload.single("file"),
  uploadFile
);

router.get(
  "/teams/:teamId/uploads",
  authenticate,
  requireTeamAccess,
  getTeamFiles
);

router.delete(
  "/uploads/:uploadId",
  authenticate,
  requireUploadAccess,
  deleteFile
);

export default router;
