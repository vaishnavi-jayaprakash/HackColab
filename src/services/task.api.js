import { apiRequest, USE_MOCK, mockDelay } from "./api.js";
import { tasks as mockTasks, taskColumns } from "../mock/tasks.js";

let localTasks = [...mockTasks];

export async function getTaskColumns() {
  if (USE_MOCK) return mockDelay(taskColumns);
  return apiRequest("/tasks/columns");
}

export async function getTasks(hackathonId) {
  if (USE_MOCK) return mockDelay(localTasks);
  return apiRequest(`/hackathons/${hackathonId}/tasks`);
}

export async function moveTask(taskId, toColumn) {
  if (USE_MOCK) {
    localTasks = localTasks.map((t) => (t.id === taskId ? { ...t, column: toColumn } : t));
    return mockDelay({ id: taskId, column: toColumn }, 150);
  }
  return apiRequest(`/tasks/${taskId}/move`, { method: "PATCH", body: { column: toColumn } });
}

export async function createTask(payload) {
  if (USE_MOCK) {
    const task = { id: `t${Date.now()}`, column: "backlog", ...payload };
    localTasks = [task, ...localTasks];
    return mockDelay(task);
  }
  return apiRequest("/tasks", { method: "POST", body: payload });
}
