import prisma from "../lib/prisma.js";

/** Requires membership of, or leadership of, the requested team. */
export async function requireTeamAccess(req, res, next) {
  try {
    const team = await prisma.team.findFirst({
      where: {
        id: req.params.teamId,
        OR: [
          { leadId: req.userId },
          { members: { some: { userId: req.userId } } },
        ],
      },
      select: { id: true },
    });
    if (!team) return res.status(403).json({ success: false, message: "You do not have access to this team" });
    next();
  } catch (error) {
    console.error("Team access check error:", error);
    return res.status(500).json({ success: false, message: "Failed to verify team access" });
  }
}

/** Requires membership of or leadership of a team in the requested hackathon. */
export async function requireHackathonAccess(req, res, next) {
  try {
    const hackathonId = req.params.hackathonId || req.params.id;
    const hackathon = await prisma.hackathon.findFirst({
      where: {
        id: hackathonId,
        teams: {
          some: {
            OR: [
              { leadId: req.userId },
              { members: { some: { userId: req.userId } } },
            ],
          },
        },
      },
      select: { id: true },
    });
    if (!hackathon) return res.status(403).json({ success: false, message: "You do not have access to this hackathon" });
    next();
  } catch (error) {
    console.error("Hackathon access check error:", error);
    return res.status(500).json({ success: false, message: "Failed to verify hackathon access" });
  }
}

async function hasTeamAccess(teamId, userId) {
  return prisma.team.findFirst({
    where: {
      id: teamId,
      OR: [{ leadId: userId }, { members: { some: { userId } } }],
    },
    select: { id: true },
  });
}

function requireResourceAccess(loadTeamId) {
  return async (req, res, next) => {
    try {
      const teamId = await loadTeamId(req.params);
      if (!teamId || !(await hasTeamAccess(teamId, req.userId))) {
        return res.status(403).json({ success: false, message: "You do not have access to this team resource" });
      }
      next();
    } catch (error) {
      console.error("Team resource access check error:", error);
      return res.status(500).json({ success: false, message: "Failed to verify team access" });
    }
  };
}

export const requireTaskAccess = requireResourceAccess(async ({ taskId }) =>
  (await prisma.task.findUnique({ where: { id: taskId }, select: { teamId: true } }))?.teamId
);
export const requireRepositoryAccess = requireResourceAccess(async ({ repositoryId }) =>
  (await prisma.repository.findUnique({ where: { id: repositoryId }, select: { teamId: true } }))?.teamId
);
export const requireUploadAccess = requireResourceAccess(async ({ uploadId }) =>
  (await prisma.upload.findUnique({ where: { id: uploadId }, select: { teamId: true } }))?.teamId
);
export const requireSubmissionAccess = requireResourceAccess(async ({ itemId }) =>
  (await prisma.submissionItem.findUnique({ where: { id: itemId }, select: { teamId: true } }))?.teamId
);

export async function requireDeadlineAccess(req, res, next) {
  try {
    const deadline = await prisma.deadline.findFirst({
      where: {
        id: req.params.deadlineId,
        hackathon: {
          teams: {
            some: {
              OR: [{ leadId: req.userId }, { members: { some: { userId: req.userId } } }],
            },
          },
        },
      },
      select: { id: true },
    });
    if (!deadline) return res.status(403).json({ success: false, message: "You do not have access to this deadline" });
    next();
  } catch (error) {
    console.error("Deadline access check error:", error);
    return res.status(500).json({ success: false, message: "Failed to verify deadline access" });
  }
}
