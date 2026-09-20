import { apiRequest, USE_MOCK, mockDelay } from "./api.js";
import { submissionChecklist } from "../mock/dashboard.js";

let localChecklist = JSON.parse(JSON.stringify(submissionChecklist));

export async function getSubmissionChecklist(hackathonId) {
  if (USE_MOCK) return mockDelay(localChecklist);
  return apiRequest(`/hackathons/${hackathonId}/submission`);
}

export async function toggleChecklistItem(itemId, done) {
  if (USE_MOCK) {
    localChecklist = {
      ...localChecklist,
      items: localChecklist.items.map((i) => (i.id === itemId ? { ...i, done } : i)),
    };
    return mockDelay({ id: itemId, done }, 150);
  }
  return apiRequest(`/submission/items/${itemId}`, { method: "PATCH", body: { done } });
}

export async function submitProject(hackathonId) {
  if (USE_MOCK) return mockDelay({ status: "submitted" }, 600);
  return apiRequest(`/hackathons/${hackathonId}/submit`, { method: "POST" });
}
