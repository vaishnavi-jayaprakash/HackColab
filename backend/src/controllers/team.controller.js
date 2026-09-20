import prisma from "../lib/prisma.js";

async function getLeadTeam(teamId, userId) {
  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) return { error: [404, "Team not found"] };
  if (team.leadId !== userId) {
    return { error: [403, "Only the team lead can manage members or delete this team"] };
  }
  return { team };
}
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
    const { userId, email } = req.body;

    if (!userId && !email) {
      return res.status(400).json({
        success: false,
        message: "User email or ID is required",
      });
    }

    const leadCheck = await getLeadTeam(teamId, req.userId);
    if (leadCheck.error) {
      const [status, message] = leadCheck.error;
      return res.status(status).json({ success: false, message });
    }

    const normalizedEmail = email?.trim().toLowerCase();
    const user = userId
      ? await prisma.user.findUnique({ where: { id: userId } })
      : await prisma.user.findUnique({ where: { email: normalizedEmail } });

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
          userId: user.id,
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
        userId: user.id,
        role: "MEMBER",
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

const removeTeamMember = async (req, res) => {
  try {
    const { teamId, userId } = req.params;
    const leadCheck = await getLeadTeam(teamId, req.userId);
    if (leadCheck.error) {
      const [status, message] = leadCheck.error;
      return res.status(status).json({ success: false, message });
    }
    if (leadCheck.team.leadId === userId) {
      return res.status(400).json({
        success: false,
        message: "Delete the team instead of removing its lead",
      });
    }

    const member = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId } },
    });
    if (!member) return res.status(404).json({ success: false, message: "Team member not found" });

    await prisma.teamMember.delete({ where: { id: member.id } });
    return res.status(200).json({ success: true, message: "Member removed successfully" });
  } catch (error) {
    console.error("Remove team member error:", error);
    return res.status(500).json({ success: false, message: "Failed to remove team member" });
  }
};

// =====================================
// INVITE A NEW MEMBER
// =====================================

const inviteTeamMember = async (req, res) => {
  try {
    const { teamId } = req.params;
    const email = req.body.email?.trim().toLowerCase();
    if (!email) return res.status(400).json({ success: false, message: "An email address is required" });

    const leadCheck = await getLeadTeam(teamId, req.userId);
    if (leadCheck.error) {
      const [status, message] = leadCheck.error;
      return res.status(status).json({ success: false, message });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "This person already has an account. Add them as a registered member instead.",
      });
    }

    const invitation = await prisma.teamInvitation.upsert({
      where: { teamId_email: { teamId, email } },
      update: { invitedById: req.userId, status: "PENDING", acceptedAt: null },
      create: { teamId, email, invitedById: req.userId },
    });

    return res.status(201).json({
      success: true,
      message: "Invitation created. The member will join this team after signing up with this email.",
      data: { invitation },
    });
  } catch (error) {
    console.error("Invite team member error:", error);
    return res.status(500).json({ success: false, message: "Failed to create invitation" });
  }
};

const getTeamInvitations = async (req, res) => {
  try {
    const { teamId } = req.params;
    const leadCheck = await getLeadTeam(teamId, req.userId);
    if (leadCheck.error) {
      const [status, message] = leadCheck.error;
      return res.status(status).json({ success: false, message });
    }
    const invitations = await prisma.teamInvitation.findMany({
      where: { teamId, status: "PENDING" },
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json({ success: true, data: { invitations } });
  } catch (error) {
    console.error("Get team invitations error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch invitations" });
  }
};

const deleteTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const leadCheck = await getLeadTeam(teamId, req.userId);
    if (leadCheck.error) {
      const [status, message] = leadCheck.error;
      return res.status(status).json({ success: false, message });
    }

    await prisma.team.delete({ where: { id: teamId } });
    return res.status(200).json({
      success: true,
      message: "Team and its associated database data deleted successfully",
    });
  } catch (error) {
    console.error("Delete team error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete team" });
  }
};

export {
  createTeam,
  getTeamById,
  addTeamMember,
  inviteTeamMember,
  getTeamInvitations,
  removeTeamMember,
  deleteTeam,
  getTeamMembers,
};
