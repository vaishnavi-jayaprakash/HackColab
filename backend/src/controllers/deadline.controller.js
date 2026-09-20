import prisma from "../lib/prisma.js";

// CREATE DEADLINE
export async function createDeadline(req, res) {
  try {
    const { hackathonId } = req.params;

    const {
      title,
      description,
      deadlineAt,
      type
    } = req.body;

    if (!title || !deadlineAt || !type) {
      return res.status(400).json({
        success: false,
        message: "Title, deadlineAt and type are required"
      });
    }

    // Check hackathon exists
    const hackathon = await prisma.hackathon.findUnique({
      where: {
        id: hackathonId
      }
    });

    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: "Hackathon not found"
      });
    }

    const deadline = await prisma.deadline.create({
      data: {
        hackathonId,
        title,
        description: description || null,
        deadlineAt: new Date(deadlineAt),
        type
      }
    });

    return res.status(201).json({
      success: true,
      message: "Deadline created successfully",
      deadline
    });

  } catch (error) {
    console.error("Create deadline error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create deadline"
    });
  }
}


// GET ALL DEADLINES FOR HACKATHON
export async function getHackathonDeadlines(req, res) {
  try {
    const { hackathonId } = req.params;

    const hackathon = await prisma.hackathon.findUnique({
      where: {
        id: hackathonId
      }
    });

    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: "Hackathon not found"
      });
    }

    const deadlines = await prisma.deadline.findMany({
      where: {
        hackathonId
      },
      orderBy: {
        deadlineAt: "asc"
      }
    });

    return res.status(200).json({
      success: true,
      count: deadlines.length,
      deadlines
    });

  } catch (error) {
    console.error("Get deadlines error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch deadlines"
    });
  }
}


// GET SINGLE DEADLINE
export async function getDeadlineById(req, res) {
  try {
    const { deadlineId } = req.params;

    const deadline = await prisma.deadline.findUnique({
      where: {
        id: deadlineId
      },
      include: {
        hackathon: true
      }
    });

    if (!deadline) {
      return res.status(404).json({
        success: false,
        message: "Deadline not found"
      });
    }

    return res.status(200).json({
      success: true,
      deadline
    });

  } catch (error) {
    console.error("Get deadline error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch deadline"
    });
  }
}


// UPDATE DEADLINE
export async function updateDeadline(req, res) {
  try {
    const { deadlineId } = req.params;

    const {
      title,
      description,
      deadlineAt,
      type
    } = req.body;

    const existingDeadline = await prisma.deadline.findUnique({
      where: {
        id: deadlineId
      }
    });

    if (!existingDeadline) {
      return res.status(404).json({
        success: false,
        message: "Deadline not found"
      });
    }

    const deadline = await prisma.deadline.update({
      where: {
        id: deadlineId
      },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(deadlineAt !== undefined && {
          deadlineAt: new Date(deadlineAt)
        }),
        ...(type !== undefined && { type })
      }
    });

    return res.status(200).json({
      success: true,
      message: "Deadline updated successfully",
      deadline
    });

  } catch (error) {
    console.error("Update deadline error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update deadline"
    });
  }
}


// DELETE DEADLINE
export async function deleteDeadline(req, res) {
  try {
    const { deadlineId } = req.params;

    const existingDeadline = await prisma.deadline.findUnique({
      where: {
        id: deadlineId
      }
    });

    if (!existingDeadline) {
      return res.status(404).json({
        success: false,
        message: "Deadline not found"
      });
    }

    await prisma.deadline.delete({
      where: {
        id: deadlineId
      }
    });

    return res.status(200).json({
      success: true,
      message: "Deadline deleted successfully"
    });

  } catch (error) {
    console.error("Delete deadline error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete deadline"
    });
  }
}