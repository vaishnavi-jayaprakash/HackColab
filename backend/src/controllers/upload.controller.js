import prisma from "../lib/prisma.js";
import { uploadToS3, deleteFromS3 } from "../services/s3.service.js";


// =====================================
// UPLOAD FILE
// =====================================

export async function uploadFile(req, res) {
  try {
    const { teamId } = req.params;

    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "File is required",
      });
    }

    // Check team
    const team = await prisma.team.findUnique({
      where: {
        id: teamId,
      },
    });

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    // Generate unique S3 key
    const timestamp = Date.now();

    const safeFileName = file.originalname
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9._-]/g, "");

    const s3Key =
      `teams/${teamId}/${timestamp}-${safeFileName}`;

    // Upload to S3
    await uploadToS3({
      key: s3Key,
      buffer: file.buffer,
      contentType: file.mimetype,
    });

    // Save metadata
    const upload = await prisma.upload.create({
      data: {
        teamId,
        uploadedBy: req.userId,
        fileName: file.originalname,
        s3Key,
        fileType: file.mimetype,
        fileSize: file.size,
      },
    });

    return res.status(201).json({
      success: true,
      message: "File uploaded successfully",
      upload,
    });

  } catch (error) {

    console.error("Upload file error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to upload file",
    });
  }
}


// =====================================
// GET TEAM FILES
// =====================================

export async function getTeamFiles(req, res) {
  try {
    const { teamId } = req.params;

    const uploads = await prisma.upload.findMany({
      where: {
        teamId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      count: uploads.length,
      uploads,
    });

  } catch (error) {

    console.error("Get files error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch files",
    });
  }
}


// =====================================
// DELETE FILE
// =====================================

export async function deleteFile(req, res) {
  try {
    const { uploadId } = req.params;

    const upload = await prisma.upload.findUnique({
      where: {
        id: uploadId,
      },
    });

    if (!upload) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    // Delete from S3
    await deleteFromS3(upload.s3Key);

    // Delete metadata
    await prisma.upload.delete({
      where: {
        id: uploadId,
      },
    });

    return res.status(200).json({
      success: true,
      message: "File deleted successfully",
    });

  } catch (error) {

    console.error("Delete file error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete file",
    });
  }
}