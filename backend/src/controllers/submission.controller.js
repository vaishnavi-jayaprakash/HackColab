import prisma from "../lib/prisma.js";

// CREATE SUBMISSION ITEM
export async function createSubmissionItem(req, res) {
  try {
    const { teamId } = req.params;
    const {
      title,
      description,
      required,
      assignedTo,
    } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    // If assigning to someone, verify team membership
    if (assignedTo) {
      const member = await prisma.teamMember.findUnique({
        where: {
          teamId_userId: {
            teamId,
            userId: assignedTo,
          },
        },
      });

      if (!member) {
        return res.status(400).json({
          success: false,
          message: "Assignee must be a member of this team",
        });
      }
    }

    const item = await prisma.submissionItem.create({
      data: {
        teamId,
        title,
        description: description || null,
        required: required ?? true,
        status: "PENDING",
        assignedTo: assignedTo || null,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Submission item created successfully",
      item,
    });
  } catch (error) {
    console.error("Create submission item error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create submission item",
    });
  }
}


// GET TEAM SUBMISSION CHECKLIST
export async function getTeamSubmissionItems(req, res) {
  try {
    const { teamId } = req.params;

    const items = await prisma.submissionItem.findMany({
      where: { teamId },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        upload: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return res.status(200).json({
      success: true,
      count: items.length,
      items,
    });
  } catch (error) {
    console.error("Get submission items error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch submission checklist",
    });
  }
}


// UPDATE SUBMISSION ITEM
export async function updateSubmissionItem(req, res) {
  try {
    const { itemId } = req.params;

    const {
      title,
      description,
      required,
      status,
      assignedTo,
      uploadId,
    } = req.body;

    const existingItem = await prisma.submissionItem.findUnique({
      where: { id: itemId },
    });

    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: "Submission item not found",
      });
    }

    // Validate assignee
    if (assignedTo !== undefined && assignedTo !== null) {
      const member = await prisma.teamMember.findUnique({
        where: {
          teamId_userId: {
            teamId: existingItem.teamId,
            userId: assignedTo,
          },
        },
      });

      if (!member) {
        return res.status(400).json({
          success: false,
          message: "Assignee must be a member of this team",
        });
      }
    }

    // Validate upload belongs to same team
    if (uploadId !== undefined && uploadId !== null) {
      const upload = await prisma.upload.findUnique({
        where: { id: uploadId },
      });

      if (!upload || upload.teamId !== existingItem.teamId) {
        return res.status(400).json({
          success: false,
          message: "Upload must belong to this team",
        });
      }
    }

    const item = await prisma.submissionItem.update({
      where: { id: itemId },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(required !== undefined && { required }),
        ...(status !== undefined && { status }),
        ...(assignedTo !== undefined && {
          assignedTo: assignedTo || null,
        }),
        ...(uploadId !== undefined && {
          uploadId: uploadId || null,
        }),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Submission item updated successfully",
      item,
    });
  } catch (error) {
    console.error("Update submission item error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update submission item",
    });
  }
}


// DELETE SUBMISSION ITEM
export async function deleteSubmissionItem(req, res) {
  try {
    const { itemId } = req.params;

    const existingItem = await prisma.submissionItem.findUnique({
      where: { id: itemId },
    });

    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: "Submission item not found",
      });
    }

    await prisma.submissionItem.delete({
      where: { id: itemId },
    });

    return res.status(200).json({
      success: true,
      message: "Submission item deleted successfully",
    });
  } catch (error) {
    console.error("Delete submission item error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete submission item",
    });
  }
}