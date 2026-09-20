import { apiRequest } from "./api.js";
import { resolveWorkspace } from "./workspace.js";
import { adaptMember } from "./adapters.js";

export async function getTeam(teamId) {
  const id = teamId || (await resolveWorkspace()).teamId;
  const res = await apiRequest(`/teams/${id}`);
  return res.data?.team;
}

export async function getTeamMembers(teamId) {
  const id = teamId || (await resolveWorkspace()).teamId;
  const res = await apiRequest(`/teams/${id}/members`);
  return (res.data?.members || []).map((m, i) => adaptMember(m, i));
}

export async function createTeam(hackathonId, { name, description }) {
  const res = await apiRequest(`/hackathons/${hackathonId}/teams`, {
    method: "POST",
    body: { name, description },
  });
  return res.data?.team;
}

export async function addTeamMember(teamId, { userId, email, role }) {
  const id = teamId || (await resolveWorkspace()).teamId;
  const res = await apiRequest(`/teams/${id}/members`, {
    method: "POST",
    body: { userId, email, role },
  });
  return res.data?.member;
}

export async function inviteTeamMember(teamId, email) {
  const res = await apiRequest(`/teams/${teamId}/invitations`, {
    method: "POST",
    body: { email },
  });
  return res.data?.invitation;
}

export async function getTeamInvitations(teamId) {
  const res = await apiRequest(`/teams/${teamId}/invitations`);
  return res.data?.invitations || [];
}

export async function removeTeamMember(teamId, userId) {
  await apiRequest(`/teams/${teamId}/members/${userId}`, { method: "DELETE" });
}

export async function deleteTeam(teamId) {
  await apiRequest(`/teams/${teamId}`, { method: "DELETE" });
}
