import { apiRequest } from "./api.js";
import { resolveWorkspace } from "./workspace.js";
import { adaptTask, adaptMember, columnToStatus } from "./adapters.js";

const TASK_COLUMNS = [
  { id: "backlog", title: "Backlog" },
  { id: "todo", title: "To Do" },
  { id: "in_progress", title: "In Progress" },
  { id: "in_review", title: "In Review" },
  { id: "done", title: "Done" },
];

export function getTaskColumns() {
  return TASK_COLUMNS;
}

export async function getTasks(hackathonId) {
  const { teamId } = await resolveWorkspace({ hackathonId });
  const res = await apiRequest(`/teams/${teamId}/tasks`);
  return (res.data?.tasks || []).map(adaptTask);
}

export async function getTaskById(taskId) {
  const res = await apiRequest(`/tasks/${taskId}`);
  return adaptTask(res.data?.task);
}

export async function getTeamMembers(hackathonId) {
  const { teamId } = await resolveWorkspace({ hackathonId });
  const res = await apiRequest(`/teams/${teamId}/members`);
  return (res.data?.members || []).map((m, i) => adaptMember(m, i));
}

export async function moveTask(taskId, toColumn) {
  await apiRequest(`/tasks/${taskId}`, {
    method: "PATCH",
    body: { status: columnToStatus(toColumn) },
  });
  return { id: taskId, column: toColumn };
}

export async function createTask(payload, hackathonId) {
  const { teamId } = await resolveWorkspace({ hackathonId });
  const res = await apiRequest(`/teams/${teamId}/tasks`, {
    method: "POST",
    body: {
      title: payload.title,
      description: payload.description || undefined,
      priority: payload.priority || "MEDIUM",
      assigneeId: payload.assigneeId || undefined,
      dueDate: payload.dueDate || undefined,
    },
  });
  return adaptTask(res.data?.task);
}

export async function updateTask(taskId, payload) {
  const body = {};
  if (payload.title !== undefined) body.title = payload.title;
  if (payload.description !== undefined) body.description = payload.description;
  if (payload.priority !== undefined) body.priority = payload.priority;
  if (payload.assigneeId !== undefined) body.assigneeId = payload.assigneeId || null;
  if (payload.dueDate !== undefined) body.dueDate = payload.dueDate || null;
  if (payload.column !== undefined) body.status = columnToStatus(payload.column);
  if (payload.status !== undefined) body.status = payload.status;

  const res = await apiRequest(`/tasks/${taskId}`, {
    method: "PATCH",
    body,
  });
  return adaptTask(res.data?.task);
}

export async function deleteTask(taskId) {
  await apiRequest(`/tasks/${taskId}`, { method: "DELETE" });
}
