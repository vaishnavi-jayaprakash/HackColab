import { apiRequest } from "./api.js";
import { resolveWorkspace } from "./workspace.js";
import { adaptSubmissionItem, adaptUpload } from "./adapters.js";

function mapItems(items) {
  return items.map((item) => adaptSubmissionItem(item));
}

export async function getSubmissionChecklist(hackathonId) {
  const workspace = await resolveWorkspace({ hackathonId });
  const [itemsRes, filesRes, hackathonRes] = await Promise.all([
    apiRequest(`/teams/${workspace.teamId}/submissions`),
    apiRequest(`/teams/${workspace.teamId}/uploads`),
    apiRequest(`/hackathons/${workspace.hackathonId}`),
  ]);

  const hackathon = hackathonRes.data?.hackathon;

  return {
    hackathonId: workspace.hackathonId,
    dueISO: hackathon?.submissionDeadline || hackathon?.endDate || null,
    items: mapItems(itemsRes.items || []),
    uploadedFiles: (filesRes.uploads || []).map(adaptUpload),
  };
}

export async function createChecklistItem({ title, description, required }, hackathonId) {
  const { teamId } = await resolveWorkspace({ hackathonId });
  const res = await apiRequest(`/teams/${teamId}/submissions`, {
    method: "POST",
    body: { title, description, required },
  });
  return adaptSubmissionItem(res.item);
}

export async function toggleChecklistItem(itemId, done) {
  await apiRequest(`/submissions/${itemId}`, {
    method: "PATCH",
    body: { status: done ? "COMPLETED" : "PENDING" },
  });
  return { id: itemId, done };
}

export async function updateChecklistItem(itemId, payload) {
  const res = await apiRequest(`/submissions/${itemId}`, {
    method: "PATCH",
    body: payload,
  });
  return adaptSubmissionItem(res.item);
}

export async function deleteChecklistItem(itemId) {
  await apiRequest(`/submissions/${itemId}`, { method: "DELETE" });
}
