import prisma from "../lib/prisma.js";
// =====================================
// CREATE TEAM
// =====================================

const createTeam = async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Team name is required",
      });
    }

    // Check hackathon
    const hackathon = await prisma.hackathon.findUnique({
      where: {
        id: hackathonId,
      },
    });

    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: "Hackathon not found",
      });
    }

    // Create team
    const team = await prisma.team.create({
      data: {
        hackathonId,
        name,
        description,
        leadId: req.userId,
      },
    });

    // Automatically make creator the team lead/member
    await prisma.teamMember.create({
      data: {
        teamId: team.id,
        userId: req.userId,
        role: "LEAD",
      },
    });

    const createdTeam = await prisma.team.findUnique({
      where: {
        id: team.id,
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Team created successfully",
      data: {
        team: createdTeam,
      },
    });
  } catch (error) {
    console.error("Create team error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create team",
    });
  }
};

// =====================================
// GET TEAM
// =====================================

const getTeamById = async (req, res) => {
  try {
    const { teamId } = req.params;

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

        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },

        tasks: true,

        repositories: true,

        uploads: true,

        submissionItems: true,
      },
    });

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        team,
      },
    });
  } catch (error) {
    console.error("Get team error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch team",
    });
  }
};

// =====================================
// ADD MEMBER
// =====================================

const addTeamMember = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { userId, role } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
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

    // Check user
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check existing membership
    const existingMember = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId,
        },
      },
    });

    if (existingMember) {
      return res.status(409).json({
        success: false,
        message: "User is already a team member",
      });
    }

    const member = await prisma.teamMember.create({
      data: {
        teamId,
        userId,
        role: role || "MEMBER",
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
    });

    return res.status(201).json({
      success: true,
      message: "Member added successfully",
      data: {
        member,
      },
    });
  } catch (error) {
    console.error("Add team member error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add team member",
    });
  }
};

// =====================================
// GET TEAM MEMBERS
// =====================================

const getTeamMembers = async (req, res) => {
  try {
    const { teamId } = req.params;

    const members = await prisma.teamMember.findMany({
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
    });

    return res.status(200).json({
      success: true,
      data: {
        members,
      },
    });
  } catch (error) {
    console.error("Get team members error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch team members",
    });
  }
};

export {
  createTeam,
  getTeamById,
  addTeamMember,
  getTeamMembers,
};