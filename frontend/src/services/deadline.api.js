import { apiRequest } from "./api.js";
import { resolveWorkspace } from "./workspace.js";

export async function getDeadlines(hackathonId) {
  const id = hackathonId || (await resolveWorkspace()).hackathonId;
  const res = await apiRequest(`/hackathons/${id}/deadlines`);
  return res.deadlines || [];
}

export async function getAllDeadlines() {
  const listRes = await apiRequest("/hackathons");
  const hackathons = listRes.data?.hackathons || [];
  const all = [];

  for (const h of hackathons) {
    try {
      const res = await apiRequest(`/hackathons/${h.id}/deadlines`);
      for (const d of res.deadlines || []) {
        all.push({ ...d, hackathonName: h.name, hackathonId: h.id });
      }
    } catch {
      /* skip */
    }
  }

  return all.sort((a, b) => new Date(a.deadlineAt) - new Date(b.deadlineAt));
}

export async function createDeadline(payload) {
  const workspace = await resolveWorkspace();
  const hackathonId = payload.hackathonId || workspace.hackathonId;
  const res = await apiRequest(`/hackathons/${hackathonId}/deadlines`, {
    method: "POST",
    body: {
      title: payload.title,
      description: payload.description,
      deadlineAt: payload.deadlineAt,
      type: payload.type || "INTERNAL",
    },
  });
  return res.deadline;
}

export async function updateDeadline(deadlineId, payload) {
  const res = await apiRequest(`/deadlines/${deadlineId}`, {
    method: "PATCH",
    body: payload,
  });
  return res.deadline;
}

export async function deleteDeadline(deadlineId) {
  await apiRequest(`/deadlines/${deadlineId}`, { method: "DELETE" });
}
