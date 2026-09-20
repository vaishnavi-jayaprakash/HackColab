import { apiRequest } from "./api.js";
import { resolveWorkspace, refreshWorkspace, writeWorkspace } from "./workspace.js";
import {
  adaptHackathon,
  adaptMember,
  buildDashboardStats,
  buildRecentActivity,
} from "./adapters.js";

export async function getHackathons() {
  let workspace = null;
  try {
    workspace = await resolveWorkspace();
  } catch {
    /* user may have no team yet */
  }

  const listRes = await apiRequest("/hackathons");
  const list = listRes.data?.hackathons || [];
  let extras = {};

  if (workspace?.teamId) {
    try {
      const dash = await apiRequest(`/teams/${workspace.teamId}/dashboard`);
      extras = {
        conflicts: dash.git?.stats?.openConflicts || 0,
        tasksCompleted: dash.tasks?.stats?.done || 0,
        tasksTotal: dash.tasks?.stats?.total || 0,
      };
    } catch {
      /* optional */
    }
  }

  return list.map((h) =>
    adaptHackathon(h, workspace && h.id === workspace.hackathonId ? extras : {})
  );
}

export async function getHackathonById(id) {
  const res = await apiRequest(`/hackathons/${id}`);
  const hackathon = res.data?.hackathon;
  if (!hackathon) return null;

  // A hackathon can have many teams. Keep its detail page tied to the
  // authenticated user's selected persisted workspace instead of displaying
  // whichever team the database happens to return first.
  let workspace = null;
  try {
    workspace = await resolveWorkspace({ hackathonId: id });
  } catch {
    // The hackathon can still be displayed before the user has a workspace.
  }
  const team =
    hackathon.teams?.find((candidate) => candidate.id === workspace?.teamId) ||
    hackathon.teams?.[0];
  const members = (team?.members || []).map((m, i) => adaptMember(m, i));
  let extras = { team: members, teamId: team?.id, teamLeadId: team?.leadId };

  if (team?.id) {
    try {
      const dash = await apiRequest(`/teams/${team.id}/dashboard`);
      extras = {
        ...extras,
        conflicts: dash.git?.stats?.openConflicts || 0,
        tasksCompleted: dash.tasks?.stats?.done || 0,
        tasksTotal: dash.tasks?.stats?.total || 0,
      };
    } catch {
      /* keep defaults */
    }
  }

  return adaptHackathon(hackathon, extras);
}

export async function createHackathon(payload) {
  const res = await apiRequest("/hackathons", {
    method: "POST",
    body: payload,
  });
  return res.data?.hackathon;
}

export async function createHackathonWithTeam({
  name,
  description,
  organizerName,
  startDate,
  endDate,
  submissionDeadline,
  status,
  teamName,
}) {
  const hackathon = await createHackathon({
    name,
    description,
    organizerName,
    startDate,
    endDate,
    submissionDeadline,
    status: status || "ACTIVE",
  });

  const teamRes = await apiRequest(`/hackathons/${hackathon.id}/teams`, {
    method: "POST",
    body: { name: teamName || "Team", description: "Primary team" },
  });
  const team = teamRes.data?.team;

  writeWorkspace({ hackathonId: hackathon.id, teamId: team.id });
  await refreshWorkspace();

  return { hackathon, team };
}

export async function getDashboardSummary() {
  let workspace;
  try {
    workspace = await resolveWorkspace();
  } catch {
    return {
      stats: {
        activeHackathons: 0,
        activeHackathonsNote: "none joined yet",
        tasksDueSoon: 0,
        tasksDueSoonNote: "next 7 days",
        upcomingDeadlines: 0,
        upcomingDeadlinesNote: "this week",
        gitConflicts: 0,
        gitConflictsNote: "need attention",
        projectFiles: 0,
        projectFilesNote: "on S3",
      },
      hackathons: [],
      recentActivity: [],
      teamMembers: [],
      workspace: null,
      hackathonName: null,
    };
  }
  const dash = await apiRequest(`/teams/${workspace.teamId}/dashboard`);
  const listRes = await apiRequest("/hackathons");
  const list = listRes.data?.hackathons || [];

  const featuredExtras = {
    conflicts: dash.git?.stats?.openConflicts || 0,
    tasksCompleted: dash.tasks?.stats?.done || 0,
    tasksTotal: dash.tasks?.stats?.total || 0,
    team: (dash.members || []).map((m, i) => adaptMember(m, i)),
  };

  const adaptedHackathons = list.map((h) =>
    adaptHackathon(h, h.id === workspace.hackathonId ? featuredExtras : {})
  );

  adaptedHackathons.sort((a, b) => {
    if (a.id === workspace.hackathonId) return -1;
    if (b.id === workspace.hackathonId) return 1;
    return 0;
  });

  if (adaptedHackathons.length === 0 && dash.hackathon) {
    adaptedHackathons.push(adaptHackathon(dash.hackathon, featuredExtras));
  }

  const stats = buildDashboardStats(dash);
  stats.activeHackathons = list.length || adaptedHackathons.length;

  return {
    stats,
    hackathons: adaptedHackathons,
    recentActivity: buildRecentActivity(dash),
    teamMembers: featuredExtras.team,
    workspace,
    hackathonName: dash.hackathon?.name || adaptedHackathons[0]?.name,
  };
}
