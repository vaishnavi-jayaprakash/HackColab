import { apiRequest } from "./api.js";
import { createDeadline } from "./deadline.api.js";
import { adaptDeadlineToEvent } from "./adapters.js";
import { getWeekDays } from "../utils/date.js";

const LEGEND_COLORS = ["#22c55e", "#c084fc", "#60a5fa", "#facc15", "#f87171", "#8b95ac"];

export async function getCalendarEvents(hackathonId) {
  if (!hackathonId) throw new Error("A hackathon is required to load its calendar.");
  const weekStart = getWeekDays()[0];
  const res = await apiRequest(`/hackathons/${hackathonId}/deadlines`);
  return (res.deadlines || [])
    .map((deadline) => adaptDeadlineToEvent(deadline, hackathonId, weekStart))
    .filter(Boolean);
}

export async function getCalendarLegend(hackathonId) {
  const res = await apiRequest(`/hackathons/${hackathonId}`);
  const hackathon = res.data?.hackathon;
  return hackathon ? [{ id: hackathon.id, label: hackathon.name, color: LEGEND_COLORS[0] }] : [];
}

export async function createEvent(payload) {
  return createDeadline(payload);
}
