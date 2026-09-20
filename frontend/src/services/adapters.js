/** Maps backend payloads into the shapes the existing UI already renders. */

const STATUS_TO_COLUMN = {
  BACKLOG: "backlog",
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  IN_REVIEW: "in_review",
  DONE: "done",
};

const COLUMN_TO_STATUS = {
  backlog: "BACKLOG",
  todo: "TODO",
  in_progress: "IN_PROGRESS",
  in_review: "IN_REVIEW",
  done: "DONE",
};

const PRIORITY_TAG = {
  HIGH: { label: "High", color: "#f87171" },
  MEDIUM: { label: "Medium", color: "#facc15" },
  LOW: { label: "Low", color: "#60a5fa" },
};

const HACKATHON_STATUS = {
  ACTIVE: "On Track",
  UPCOMING: "Upcoming",
  COMPLETED: "Planning",
  ONGOING: "On Track",
};

const MEMBER_COLORS = ["#22c55e", "#60a5fa", "#c084fc", "#facc15", "#f87171", "#38bdf8"];

export function initials(name = "") {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";
}

export function adaptUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: "Team Lead",
    initials: initials(user.name),
  };
}

export function adaptMember(member, index = 0) {
  const user = member.user || member;
  const role = member.role === "LEAD" ? "Team Lead" : member.role || "Member";
  return {
    id: user.id,
    name: user.name,
    role,
    initials: initials(user.name),
    color: MEMBER_COLORS[index % MEMBER_COLORS.length],
  };
}

export function adaptHackathon(hackathon, extras = {}) {
  if (!hackathon) return null;
  return {
    id: hackathon.id,
    name: hackathon.name,
    track: hackathon.organizerName || "Hackathon",
    status: HACKATHON_STATUS[hackathon.status] || hackathon.status || "On Track",
    dateRange: {
      start: hackathon.startDate,
      end: hackathon.endDate,
    },
    platform: extras.platform || hackathon.organizerName || "",
    conflicts: extras.conflicts ?? 0,
    tasksCompleted: extras.tasksCompleted ?? 0,
    tasksTotal: extras.tasksTotal ?? 0,
    deadlineISO: hackathon.submissionDeadline || hackathon.endDate,
    description: hackathon.description || "",
    tags: extras.tags || [],
    team: extras.team || [],
    teamId: extras.teamId || null,
    teamLeadId: extras.teamLeadId || null,
  };
}

export function adaptTask(task) {
  if (!task) return null;
  const column = STATUS_TO_COLUMN[task.status] || "backlog";
  const priority = task.priority || "MEDIUM";
  const tag = PRIORITY_TAG[priority] || PRIORITY_TAG.MEDIUM;
  let dueLabel = "No due date";
  if (task.dueDate) {
    const d = new Date(task.dueDate);
    dueLabel = `Due ${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  }
  return {
    id: task.id,
    title: task.title,
    description: task.description || "",
    column,
    status: task.status,
    priority,
    tag,
    dueLabel,
    dueDate: task.dueDate || null,
    assigneeId: task.assigneeId || task.assignee?.id || null,
    assignee: task.assignee ? initials(task.assignee.name) : null,
    assigneeName: task.assignee?.name || null,
  };
}

export function columnToStatus(column) {
  return COLUMN_TO_STATUS[column] || "BACKLOG";
}

export function adaptConflict(conflict) {
  const branchA = conflict.branchA?.name || "branch-a";
  const branchB = conflict.branchB?.name || "branch-b";
  return {
    id: conflict.id,
    branches: `${branchA} \u2194 ${branchB}`,
    file: conflict.filePath,
    severity: conflict.status === "OPEN" ? "high" : "medium",
  };
}

export function adaptRepository(repo) {
  if (!repo) {
    return {
      name: "No repository connected",
      url: "",
      lastSynced: "never",
      branchCount: 0,
      openPRs: 0,
      potentialConflicts: 0,
    };
  }
  const openPRs = (repo.pullRequests || []).filter((pr) => pr.status === "open").length;
  const conflicts = (repo.conflicts || []).filter((c) => c.status === "OPEN").length;
  return {
    id: repo.id,
    name: repo.name,
    url: repo.url,
    lastSynced: repo.lastSyncedAt
      ? formatRelative(repo.lastSyncedAt)
      : "never",
    branchCount: (repo.branches || []).length,
    openPRs,
    potentialConflicts: conflicts,
  };
}

export function adaptCommitFromPr(pr) {
  const author = pr.authorName || "contributor";
  return {
    id: pr.id,
    author,
    initials: initials(author),
    message: pr.title,
    timestamp: formatRelative(pr.updatedAt || pr.createdAt),
  };
}

export function adaptSubmissionItem(item) {
  return {
    id: item.id,
    label: item.title,
    done: item.status === "COMPLETED",
    description: item.description || "",
    required: item.required !== false,
    status: item.status,
  };
}

export function adaptUpload(upload) {
  return {
    id: upload.id,
    name: upload.fileName,
    size: upload.fileSize || 0,
    uploadedAgo: formatRelative(upload.createdAt),
  };
}

export function adaptDeadlineToEvent(deadline, hackathonId, weekStart) {
  const at = new Date(deadline.deadlineAt);
  const start = new Date(weekStart);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  if (at < start || at >= end) return null;

  const dayIndex = (at.getDay() + 6) % 7; // Mon=0
  const time = at.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return {
    id: deadline.id,
    title: deadline.title,
    hackathonId,
    dayIndex,
    time,
    highlight: deadline.type === "SUBMISSION" || /submission/i.test(deadline.title),
  };
}

export function buildDashboardStats(dashboard) {
  const now = Date.now();
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const tasksDueSoon = (dashboard.tasks?.items || []).filter((t) => {
    if (!t.dueDate || t.status === "DONE") return false;
    const due = new Date(t.dueDate).getTime();
    return due >= now && due <= now + weekMs;
  }).length;

  const upcomingDeadlines = (dashboard.deadlines || []).filter((d) => {
    const due = new Date(d.deadlineAt).getTime();
    return due >= now && due <= now + weekMs;
  }).length;

  return {
    activeHackathons: 1,
    activeHackathonsNote: "your workspace",
    tasksDueSoon,
    tasksDueSoonNote: "next 7 days",
    upcomingDeadlines,
    upcomingDeadlinesNote: "this week",
    gitConflicts: dashboard.git?.stats?.openConflicts || 0,
    gitConflictsNote: "need attention",
    projectFiles: dashboard.files?.count || 0,
    projectFilesNote: "on S3",
  };
}

export function buildRecentActivity(dashboard) {
  const items = [];

  for (const task of dashboard.tasks?.items || []) {
    items.push({
      id: `task-${task.id}`,
      type: "task",
      actor: task.assignee?.name || "Teammate",
      text: `updated task: ${task.title}`,
      timestamp: task.updatedAt || task.createdAt,
    });
  }

  for (const repo of dashboard.git?.repositories || []) {
    for (const conflict of repo.conflicts || []) {
      items.push({
        id: `conflict-${conflict.id}`,
        type: "conflict",
        actor: "System",
        text: `Potential overlap on ${conflict.filePath}`,
        timestamp: conflict.detectedAt,
      });
    }
    for (const pr of repo.pullRequests || []) {
      items.push({
        id: `pr-${pr.id}`,
        type: "git",
        actor: pr.authorName || "contributor",
        text: `opened PR: ${pr.title}`,
        timestamp: pr.updatedAt || pr.createdAt,
      });
    }
  }

  for (const file of dashboard.files?.items || []) {
    items.push({
      id: `file-${file.id}`,
      type: "upload",
      actor: "Teammate",
      text: `uploaded a file: ${file.fileName}`,
      timestamp: file.createdAt,
    });
  }

  return items
    .filter((i) => i.timestamp)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 8);
}

function formatRelative(isoString) {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hr ago`;
  const diffDay = Math.round(diffHr / 24);
  return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
}
