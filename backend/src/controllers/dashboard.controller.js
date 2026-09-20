import prisma from "../lib/prisma.js";

export async function getTeamDashboard(req, res) {
  try {
    const { teamId } = req.params;

    // Check team
    const team = await prisma.team.findUnique({
      where: {
        id: teamId,
      },
      include: {
        hackathon: true,
        lead: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    const [
      members,
      tasks,
      deadlines,
      repositories,
      uploads,
      submissions,
    ] = await Promise.all([
      prisma.teamMember.findMany({
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
          joinedAt: "asc",
        },
      }),

      prisma.task.findMany({
        where: {
          teamId,
        },
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.deadline.findMany({
        where: {
          hackathonId: team.hackathonId,
        },
        orderBy: {
          deadlineAt: "asc",
        },
      }),

      prisma.repository.findMany({
        where: {
          teamId,
        },
        include: {
          branches: true,
          pullRequests: {
            orderBy: {
              updatedAt: "desc",
            },
            take: 10,
          },
          conflicts: {
            where: {
              status: "OPEN",
            },
            orderBy: {
              detectedAt: "desc",
            },
          },
        },
      }),

      prisma.upload.findMany({
        where: {
          teamId,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.submissionItem.findMany({
        where: {
          teamId,
        },
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
            },
          },
          upload: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      }),
    ]);

    // ------------------------------
    // Task statistics
    // ------------------------------

    const taskStats = {
      total: tasks.length,
      backlog: tasks.filter(
        (task) => task.status === "BACKLOG"
      ).length,
      todo: tasks.filter(
        (task) => task.status === "TODO"
      ).length,
      inProgress: tasks.filter(
        (task) => task.status === "IN_PROGRESS"
      ).length,
      inReview: tasks.filter(
        (task) => task.status === "IN_REVIEW"
      ).length,
      done: tasks.filter(
        (task) => task.status === "DONE"
      ).length,
    };

    // ------------------------------
    // Submission statistics
    // ------------------------------

    const submissionStats = {
      total: submissions.length,
      completed: submissions.filter(
        (item) => item.status === "COMPLETED"
      ).length,
      pending: submissions.filter(
        (item) => item.status !== "COMPLETED"
      ).length,
    };

    // ------------------------------
    // Git statistics
    // ------------------------------

    const gitStats = {
      repositories: repositories.length,

      branches: repositories.reduce(
        (total, repo) => total + repo.branches.length,
        0
      ),

      pullRequests: repositories.reduce(
        (total, repo) => total + repo.pullRequests.length,
        0
      ),

      openConflicts: repositories.reduce(
        (total, repo) => total + repo.conflicts.length,
        0
      ),
    };

    return res.status(200).json({
      success: true,

      team: {
        id: team.id,
        name: team.name,
        description: team.description,
      },

      hackathon: team.hackathon,

      lead: team.lead,

      members,

      tasks: {
        items: tasks,
        stats: taskStats,
      },

      deadlines,

      git: {
        repositories,
        stats: gitStats,
      },

      files: {
        count: uploads.length,
        items: uploads,
      },

      submissions: {
        items: submissions,
        stats: submissionStats,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard",
    });
  }
}