import prisma from "../lib/prisma.js";

// =====================================
// CREATE TASK
// =====================================

const createTask = async (req, res) => {
  try {
    const { teamId } = req.params;

    const {
      title,
      description,
      priority,
      assigneeId,
      dueDate,
    } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Task title is required",
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

    if (assigneeId && team.leadId !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "Only the team lead can assign tasks",
      });
    }

    // If assignee provided, verify user
    if (assigneeId) {
      const member = await prisma.teamMember.findUnique({
        where: {
          teamId_userId: {
            teamId,
            userId: assigneeId,
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

    const task = await prisma.task.create({
      data: {
        teamId,
        title,
        description,
        status: "BACKLOG",
        priority: priority || "MEDIUM",
        assigneeId: assigneeId || null,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: {
        task,
      },
    });
  } catch (error) {
    console.error("Create task error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create task",
    });
  }
};

// =====================================
// GET TEAM TASKS
// =====================================

const getTeamTasks = async (req, res) => {
  try {
    const { teamId } = req.params;

    const tasks = await prisma.task.findMany({
      where: {
        teamId,
      },
      include: {
        assignee: {
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
      data: {
        tasks,
      },
    });
  } catch (error) {
    console.error("Get tasks error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch tasks",
    });
  }
};

// =====================================
// GET SINGLE TASK
// =====================================

const getTaskById = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await prisma.task.findUnique({
      where: {
        id: taskId,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        team: true,
      },
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        task,
      },
    });
  } catch (error) {
    console.error("Get task error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch task",
    });
  }
};

// =====================================
// UPDATE TASK
// =====================================

const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const {
      title,
      description,
      status,
      priority,
      assigneeId,
      dueDate,
    } = req.body;

    const existingTask = await prisma.task.findUnique({
      where: {
        id: taskId,
      },
    });

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Only the team lead can set or change a task's assignee.
    if (assigneeId !== undefined && (assigneeId || null) !== existingTask.assigneeId) {
      const team = await prisma.team.findUnique({
        where: { id: existingTask.teamId },
      });
      if (team?.leadId !== req.userId) {
        return res.status(403).json({
          success: false,
          message: "Only the team lead can assign or reassign tasks",
        });
      }
    }

    // Validate assignee if supplied
    if (assigneeId) {
      const member = await prisma.teamMember.findUnique({
        where: {
          teamId_userId: {
            teamId: existingTask.teamId,
            userId: assigneeId,
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

    const task = await prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
        ...(priority !== undefined && { priority }),
        ...(assigneeId !== undefined && {
          assigneeId: assigneeId || null,
        }),
        ...(dueDate !== undefined && {
          dueDate: dueDate ? new Date(dueDate) : null,
        }),
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: {
        task,
      },
    });
  } catch (error) {
    console.error("Update task error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update task",
    });
  }
};

// =====================================
// DELETE TASK
// =====================================

const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const existingTask = await prisma.task.findUnique({
      where: {
        id: taskId,
      },
    });

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    await prisma.task.delete({
      where: {
        id: taskId,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete task error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete task",
    });
  }
};

export {
  createTask,
  getTeamTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
