import { apiRequest, USE_MOCK, mockDelay } from "./api.js";
import { repository, recentCommits, conflictRadar } from "../mock/git.js";

export async function getRepository(hackathonId) {
  if (USE_MOCK) return mockDelay(repository);
  return apiRequest(`/hackathons/${hackathonId}/repository`);
}

export async function getRecentCommits(hackathonId) {
  if (USE_MOCK) return mockDelay(recentCommits);
  return apiRequest(`/hackathons/${hackathonId}/commits`);
}

export async function getConflictRadar(hackathonId) {
  if (USE_MOCK) return mockDelay(conflictRadar);
  return apiRequest(`/hackathons/${hackathonId}/conflicts`);
}

export async function syncRepository(hackathonId) {
  if (USE_MOCK) return mockDelay({ syncedAt: new Date().toISOString() }, 700);
  return apiRequest(`/hackathons/${hackathonId}/repository/sync`, { method: "POST" });
}
