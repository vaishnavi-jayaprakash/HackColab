import prisma from "../lib/prisma.js";
import { getRepository } from "../services/github.service.js";
import { parseGithubUrl } from "../utils/github.js";

import {
  getBranches,
  getCommits,
  getCommitDetails,
  getPullRequests,
} from "../services/github.service.js";

// CONNECT REPOSITORY
export async function connectRepository(req, res) {
  try {
    const { teamId } = req.params;
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: "Repository URL is required",
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

    // Parse GitHub URL
    const parsed = parseGithubUrl(url);

    if (!parsed) {
      return res.status(400).json({
        success: false,
        message: "Invalid GitHub repository URL",
      });
    }

    const { owner, repo } = parsed;

    // Verify repository exists on GitHub
    const githubRepo = await getRepository(owner, repo);

    // Check if already connected
    const existing = await prisma.repository.findFirst({
      where: {
        teamId,
        url,
      },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Repository already connected",
      });
    }

    const repository = await prisma.repository.create({
      data: {
        teamId,
        provider: "GITHUB",
        name: githubRepo.full_name,
        url: githubRepo.html_url,
        externalRepoId: String(githubRepo.id),
        defaultBranch: githubRepo.default_branch,
      },
    });

    return res.status(201).json({
      success: true,
      message: "GitHub repository connected successfully",
      repository,
    });

  } catch (error) {
    console.error("Connect repository error:", error);

    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        message: "GitHub repository not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to connect GitHub repository",
    });
  }
}

export async function getTeamRepositories(req, res) {
  try {
    const { teamId } = req.params;

    const repositories = await prisma.repository.findMany({
      where: {
        teamId,
      },
      include: {
        branches: true,
        pullRequests: true,
        conflicts: true,
      },
      orderBy: {
        connectedAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      count: repositories.length,
      repositories,
    });

  } catch (error) {
    console.error("Get repositories error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch repositories",
    });
  }
}

export async function syncRepository(req, res) {
  try {
    const { repositoryId } = req.params;

    const repository = await prisma.repository.findUnique({
      where: {
        id: repositoryId
      }
    });

    if (!repository) {
      return res.status(404).json({
        success: false,
        message: "Repository not found"
      });
    }

    const parsed = parseGithubUrl(repository.url);

    if (!parsed) {
      return res.status(400).json({
        success: false,
        message: "Invalid GitHub repository URL"
      });
    }

    const { owner, repo } = parsed;

    // --------------------------------
    // 1. Fetch branches
    // --------------------------------

    const githubBranches = await getBranches(owner, repo);

    const syncedBranches = [];

    for (const githubBranch of githubBranches) {

      const existingBranch = await prisma.branch.findFirst({
        where: {
          repositoryId,
          name: githubBranch.name
        }
      });

      const branch = existingBranch
        ? await prisma.branch.update({
            where: {
              id: existingBranch.id
            },
            data: {
              lastCommitHash: githubBranch.commit.sha,
              lastActivityAt: new Date()
            }
          })
        : await prisma.branch.create({
            data: {
              repositoryId,
              name: githubBranch.name,
              lastCommitHash: githubBranch.commit.sha,
              lastActivityAt: new Date()
            }
          });

      syncedBranches.push(branch);
    }

    // --------------------------------
    // 2. Update repository sync time
    // --------------------------------

    await prisma.repository.update({
      where: {
        id: repositoryId
      },
      data: {
        lastSyncedAt: new Date()
      }
    });

    return res.status(200).json({
      success: true,
      message: "Repository synchronized successfully",
      branches: syncedBranches
    });

  } catch (error) {

    console.error("Repository sync error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to synchronize repository"
    });
  }
}

export async function syncBranchActivity(req, res) {
  try {
    const { repositoryId, branchId } = req.params;

    const repository = await prisma.repository.findUnique({
      where: {
        id: repositoryId
      }
    });

    if (!repository) {
      return res.status(404).json({
        success: false,
        message: "Repository not found"
      });
    }

    const branch = await prisma.branch.findUnique({
      where: {
        id: branchId
      }
    });

    if (!branch || branch.repositoryId !== repositoryId) {
      return res.status(404).json({
        success: false,
        message: "Branch not found"
      });
    }

    const parsed = parseGithubUrl(repository.url);

    if (!parsed) {
      return res.status(400).json({
        success: false,
        message: "Invalid GitHub repository URL"
      });
    }

    const { owner, repo } = parsed;

    // Get latest commits
    const commits = await getCommits(
      owner,
      repo,
      branch.name
    );

    let activityCount = 0;

    for (const commit of commits) {

      // Get detailed commit information
      const details = await getCommitDetails(
        owner,
        repo,
        commit.sha
      );

      for (const file of details.files || []) {

        const existingActivity =
          await prisma.fileActivity.findFirst({
            where: {
              branchId,
              commitHash: commit.sha,
              filePath: file.filename
            }
          });

        if (!existingActivity) {

          await prisma.fileActivity.create({
            data: {
              branchId,
              commitHash: commit.sha,
              filePath: file.filename,
              changeType: file.status,
              authorName:
                commit.author?.login ||
                commit.commit?.author?.name ||
                null,
              authorGithubId:
                commit.author?.id
                  ? String(commit.author.id)
                  : null,
              timestamp: new Date(
                commit.commit.author.date
              )
            }
          });

          activityCount++;
        }
      }
    }

    await prisma.branch.update({
      where: {
        id: branchId
      },
      data: {
        lastActivityAt: new Date()
      }
    });

    return res.status(200).json({
      success: true,
      message: "Branch activity synchronized successfully",
      commitsProcessed: commits.length,
      fileActivitiesAdded: activityCount
    });

  } catch (error) {

    console.error(
      "Branch activity sync error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to synchronize branch activity"
    });
  }
}

// =====================================
// SYNC PULL REQUESTS
// =====================================

export async function syncPullRequests(req, res) {
  try {
    const { repositoryId } = req.params;

    const repository = await prisma.repository.findUnique({
      where: {
        id: repositoryId
      }
    });

    if (!repository) {
      return res.status(404).json({
        success: false,
        message: "Repository not found"
      });
    }

    const parsed = parseGithubUrl(repository.url);

    if (!parsed) {
      return res.status(400).json({
        success: false,
        message: "Invalid GitHub repository URL"
      });
    }

    const { owner, repo } = parsed;

    const githubPRs = await getPullRequests(
      owner,
      repo
    );

    let syncedCount = 0;

    for (const pr of githubPRs) {

      const existingPR = await prisma.pullRequest.findFirst({
        where: {
          repositoryId,
          externalPrId: String(pr.id)
        }
      });

      const data = {
        repositoryId,
        externalPrId: String(pr.id),
        title: pr.title,
        url: pr.html_url,
        sourceBranch: pr.head.ref,
        targetBranch: pr.base.ref,
        authorName: pr.user?.login || null,
        status: pr.state,
        createdAt: new Date(pr.created_at),
        updatedAt: new Date(pr.updated_at)
      };

      if (existingPR) {

        await prisma.pullRequest.update({
          where: {
            id: existingPR.id
          },
          data
        });

      } else {

        await prisma.pullRequest.create({
          data
        });
      }

      syncedCount++;
    }

    return res.status(200).json({
      success: true,
      message: "Pull requests synchronized successfully",
      count: syncedCount
    });

  } catch (error) {

    console.error(
      "Pull request sync error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to synchronize pull requests"
    });
  }
}

// =====================================
// GET PULL REQUESTS
// =====================================

export async function getRepositoryPullRequests(req, res) {
  try {
    const { repositoryId } = req.params;

    const repository = await prisma.repository.findUnique({
      where: {
        id: repositoryId
      }
    });

    if (!repository) {
      return res.status(404).json({
        success: false,
        message: "Repository not found"
      });
    }

    const pullRequests = await prisma.pullRequest.findMany({
      where: {
        repositoryId
      },
      orderBy: {
        updatedAt: "desc"
      }
    });

    return res.status(200).json({
      success: true,
      count: pullRequests.length,
      pullRequests
    });

  } catch (error) {

    console.error(
      "Get pull requests error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch pull requests"
    });
  }
}