import { apiRequest, USE_MOCK, mockDelay } from "./api.js";
import { calendarEvents, calendarLegend } from "../mock/calendar.js";

export async function getCalendarEvents() {
  if (USE_MOCK) return mockDelay(calendarEvents);
  return apiRequest("/calendar/events");
}

export async function getCalendarLegend() {
  if (USE_MOCK) return mockDelay(calendarLegend);
  return apiRequest("/calendar/legend");
}

export async function createEvent(payload) {
  if (USE_MOCK) return mockDelay({ id: `e${Date.now()}`, ...payload });
  return apiRequest("/calendar/events", { method: "POST", body: payload });
}
