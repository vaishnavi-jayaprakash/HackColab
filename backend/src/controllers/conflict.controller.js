import prisma from "../lib/prisma.js";


// =====================================
// DETECT POTENTIAL CONFLICTS
// =====================================

export async function detectConflicts(req, res) {
  try {
    const { repositoryId } = req.params;

    // Check repository
    const repository = await prisma.repository.findUnique({
      where: {
        id: repositoryId,
      },
    });

    if (!repository) {
      return res.status(404).json({
        success: false,
        message: "Repository not found",
      });
    }

    // Get all file activity for this repository
    const activities = await prisma.fileActivity.findMany({
      where: {
        branch: {
          repositoryId,
        },
      },
      include: {
        branch: true,
      },
      orderBy: {
        timestamp: "desc",
      },
    });

    // Group activities by file path
    const fileMap = new Map();

    for (const activity of activities) {
      if (!fileMap.has(activity.filePath)) {
        fileMap.set(activity.filePath, []);
      }

      fileMap.get(activity.filePath).push(activity);
    }

    const detectedConflicts = [];

    // Compare branches modifying the same file
    for (const [filePath, fileActivities] of fileMap.entries()) {

      const branchMap = new Map();

      for (const activity of fileActivities) {
        if (!branchMap.has(activity.branchId)) {
          branchMap.set(activity.branchId, activity);
        }
      }

      const branches = Array.from(branchMap.values());

      if (branches.length < 2) {
        continue;
      }

      // Compare every pair of branches
      for (let i = 0; i < branches.length; i++) {

        for (let j = i + 1; j < branches.length; j++) {

          const branchA = branches[i];
          const branchB = branches[j];

          // Avoid duplicate conflict records
          const existingConflict =
            await prisma.conflict.findFirst({
              where: {
                repositoryId,
                filePath,
                OR: [
                  {
                    branchAId: branchA.branchId,
                    branchBId: branchB.branchId,
                  },
                  {
                    branchAId: branchB.branchId,
                    branchBId: branchA.branchId,
                  },
                ],
              },
            });

          if (existingConflict) {
            detectedConflicts.push(existingConflict);
            continue;
          }

          const conflict = await prisma.conflict.create({
            data: {
              repositoryId,
              branchAId: branchA.branchId,
              branchBId: branchB.branchId,
              filePath,
              status: "OPEN",
            },
          });

          detectedConflicts.push(conflict);
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: "Conflict detection completed",
      count: detectedConflicts.length,
      conflicts: detectedConflicts,
    });

  } catch (error) {

    console.error("Conflict detection error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to detect conflicts",
    });
  }
}


// =====================================
// GET REPOSITORY CONFLICTS
// =====================================

export async function getRepositoryConflicts(req, res) {
  try {
    const { repositoryId } = req.params;

    const conflicts = await prisma.conflict.findMany({
      where: {
        repositoryId,
      },
      include: {
        branchA: true,
        branchB: true,
      },
      orderBy: {
        detectedAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      count: conflicts.length,
      conflicts,
    });

  } catch (error) {

    console.error("Get conflicts error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch conflicts",
    });
  }
}