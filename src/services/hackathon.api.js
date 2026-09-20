import { apiRequest, USE_MOCK, mockDelay } from "./api.js";
import { hackathons, dashboardStats, recentActivity, teamMembers } from "../mock/dashboard.js";

export async function getHackathons() {
  if (USE_MOCK) return mockDelay(hackathons);
  return apiRequest("/hackathons");
}

export async function getHackathonById(id) {
  if (USE_MOCK) {
    const found = hackathons.find((h) => h.id === id);
    return mockDelay(found ? { ...found, team: teamMembers } : null);
  }
  return apiRequest(`/hackathons/${id}`);
}

export async function getDashboardSummary() {
  if (USE_MOCK) {
    return mockDelay({
      stats: dashboardStats,
      hackathons,
      recentActivity,
    });
  }
  return apiRequest("/dashboard/summary");
}
