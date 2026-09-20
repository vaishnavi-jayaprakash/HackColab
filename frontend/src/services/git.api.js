import { apiRequest } from "./api.js";
import { resolveWorkspace, refreshWorkspace } from "./workspace.js";
import {
  adaptRepository,
  adaptConflict,
  adaptCommitFromPr,
} from "./adapters.js";

async function loadTeamRepositories(teamId) {
  const res = await apiRequest(`/teams/${teamId}/repositories`);
  return res.repositories || [];
}

async function getPrimaryRepository(hackathonId) {
  const { teamId } = await refreshWorkspace({ hackathonId });
  const repos = await loadTeamRepositories(teamId);
  return repos[0] || null;
}

export async function listRepositories(hackathonId) {
  const { teamId } = await refreshWorkspace({ hackathonId });
  return loadTeamRepositories(teamId);
}

export async function getRepository(hackathonId) {
  const repo = await getPrimaryRepository(hackathonId);
  return adaptRepository(repo);
}

/** Backend stores PRs, not raw commits — surface open/recent PRs. */
export async function getPullRequests(hackathonId) {
  const repo = await getPrimaryRepository(hackathonId);
  if (!repo) return [];

  const prRes = await apiRequest(`/repositories/${repo.id}/pull-requests`);
  return (prRes.pullRequests || []).slice(0, 15).map(adaptCommitFromPr);
}

export async function getConflictRadar(hackathonId) {
  const repo = await getPrimaryRepository(hackathonId);
  if (!repo) return [];

  const res = await apiRequest(`/repositories/${repo.id}/conflicts`);
  return (res.conflicts || []).map(adaptConflict);
}

export async function syncRepository(hackathonId) {
  const repo = await getPrimaryRepository(hackathonId);
  if (!repo) {
    throw new Error("No GitHub repository connected. Paste a repo URL to connect first.");
  }

  await apiRequest(`/repositories/${repo.id}/sync`, { method: "POST" });

  const refreshed = await getPrimaryRepository(hackathonId);
  const branches = refreshed?.branches || [];

  await Promise.all(
    branches.slice(0, 8).map((branch) =>
      apiRequest(`/repositories/${repo.id}/branches/${branch.id}/sync`, {
        method: "POST",
      }).catch(() => null)
    )
  );

  await apiRequest(`/repositories/${repo.id}/pull-requests/sync`, {
    method: "POST",
  }).catch(() => null);

  await apiRequest(`/repositories/${repo.id}/conflicts/detect`, {
    method: "POST",
  }).catch(() => null);

  return { syncedAt: new Date().toISOString(), repositoryId: repo.id };
}

export async function connectRepository(url, hackathonId) {
  const { teamId } = await resolveWorkspace({ hackathonId });
  const res = await apiRequest(`/teams/${teamId}/repositories`, {
    method: "POST",
    body: { url },
  });
  await refreshWorkspace({ hackathonId });
  return adaptRepository(res.repository);
}

export async function detectConflicts(repositoryId) {
  const res = await apiRequest(`/repositories/${repositoryId}/conflicts/detect`, {
    method: "POST",
  });
  return (res.conflicts || []).map(adaptConflict);
}
