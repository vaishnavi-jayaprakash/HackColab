import { apiRequest } from "./api.js";

const WORKSPACE_KEY = "hackcolab_workspace";

/** Clears cached team/hackathon ids (call on logout). */
export function clearWorkspace() {
  localStorage.removeItem(WORKSPACE_KEY);
}

export function writeWorkspace(workspace) {
  localStorage.setItem(WORKSPACE_KEY, JSON.stringify(workspace));
  return workspace;
}

/**
 * Discovers every team the current user belongs to across all hackathons,
 * then picks the best match: prefer a team that already has a connected
 * repository, otherwise the first membership.
 *
 * Never invents mock/seed data — only what exists in the database.
 */
export async function resolveWorkspace({ force = false, hackathonId } = {}) {
  const meRes = await apiRequest("/auth/me");
  const userId = meRes.data?.user?.id;
  if (!userId) throw new Error("Not authenticated");

  // A page beneath /hackathons/:hackathonId must never use the cached global
  // workspace. Resolve its actual team inside that hackathon instead.
  if (hackathonId) {
    const detailRes = await apiRequest(`/hackathons/${hackathonId}`);
    const teams = detailRes.data?.hackathon?.teams || [];
    const team = teams.find((candidate) =>
      candidate.leadId === userId ||
      (candidate.members || []).some(
        (member) => member.userId === userId || member.user?.id === userId
      )
    );
    if (!team) throw new Error("You do not have a team in this hackathon.");
    return { hackathonId, teamId: team.id };
  }

  if (!force) {
    try {
      const raw = localStorage.getItem(WORKSPACE_KEY);
      if (raw) {
        const cached = JSON.parse(raw);
        if (cached?.teamId && cached?.hackathonId) {
          try {
            const teamRes = await apiRequest(`/teams/${cached.teamId}`);
            const team = teamRes.data?.team;
            const isMember = (team?.members || []).some(
              (m) => m.userId === userId || m.user?.id === userId
            );
            if (!(team && (isMember || team.leadId === userId))) {
              clearWorkspace();
            } else {
              // Prefer a teammate workspace that already has a connected repo.
              const candidates = await discoverUserTeams(userId);
              candidates.sort((a, b) => {
                if (b.repoCount !== a.repoCount) return b.repoCount - a.repoCount;
                if (b.taskCount !== a.taskCount) return b.taskCount - a.taskCount;
                return 0;
              });
              if (candidates[0] && candidates[0].teamId !== cached.teamId) {
                return writeWorkspace({
                  hackathonId: candidates[0].hackathonId,
                  teamId: candidates[0].teamId,
                });
              }
              return cached;
            }
          } catch {
            clearWorkspace();
          }
        }
      }
    } catch {
      clearWorkspace();
    }
  }

  const candidates = await discoverUserTeams(userId);
  if (candidates.length === 0) {
    throw new Error(
      "No team found for your account. Create a hackathon and team in the backend first, then log in again."
    );
  }

  // Prefer the team that already has repositories (so Git page shows real data).
  candidates.sort((a, b) => {
    if (b.repoCount !== a.repoCount) return b.repoCount - a.repoCount;
    if (b.taskCount !== a.taskCount) return b.taskCount - a.taskCount;
    return 0;
  });

  return writeWorkspace({
    hackathonId: candidates[0].hackathonId,
    teamId: candidates[0].teamId,
  });
}

async function discoverUserTeams(userId) {
  const listRes = await apiRequest("/hackathons");
  const hackathons = listRes.data?.hackathons || [];
  const found = [];

  for (const hackathon of hackathons) {
    const detailRes = await apiRequest(`/hackathons/${hackathon.id}`);
    const detail = detailRes.data?.hackathon;
    const teams = detail?.teams || [];

    for (const team of teams) {
      const isMember = (team.members || []).some(
        (m) => m.userId === userId || m.user?.id === userId
      );
      if (!isMember && team.leadId !== userId) continue;

      let repoCount = 0;
      let taskCount = 0;
      try {
        const [reposRes, tasksRes] = await Promise.all([
          apiRequest(`/teams/${team.id}/repositories`),
          apiRequest(`/teams/${team.id}/tasks`),
        ]);
        repoCount = (reposRes.repositories || []).length;
        taskCount = (tasksRes.data?.tasks || []).length;
      } catch {
        /* counts stay 0 */
      }

      found.push({
        hackathonId: hackathon.id,
        teamId: team.id,
        repoCount,
        taskCount,
      });
    }
  }

  return found;
}

/** Force re-discovery (e.g. after connecting a repo on another team). */
export async function refreshWorkspace({ hackathonId } = {}) {
  if (hackathonId) return resolveWorkspace({ hackathonId, force: true });
  clearWorkspace();
  return resolveWorkspace({ force: true });
}
