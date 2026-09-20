// Mock data standing in for the backend. Shapes here mirror what the
// real API is expected to return, so swapping mock -> live fetch later
// should mean deleting the mock import, not reshaping the UI.

export const currentUser = {
  id: "u1",
  name: "Priya N.",
  role: "Team Lead",
  email: "priya@university.edu",
  initials: "PN",
};

export const teamMembers = [
  { id: "u1", name: "Priya N.", role: "Team Lead", initials: "PN", color: "#22c55e" },
  { id: "u2", name: "Rohan K.", role: "ML · Data Pipelines", initials: "RK", color: "#60a5fa" },
  { id: "u3", name: "Sara M.", role: "Frontend · Design", initials: "SM", color: "#c084fc" },
  { id: "u4", name: "Theo J.", role: "Audio ML", initials: "TJ", color: "#facc15" },
  { id: "u5", name: "Aisha R.", role: "Backend", initials: "AR", color: "#f87171" },
];

export const hackathons = [
  {
    id: "neurahack-2026",
    name: "NeuraHack 2026",
    track: "AI / ML Track",
    status: "On Track",
    dateRange: { start: "2026-08-01", end: "2026-08-02" },
    platform: "Devpost",
    conflicts: 2,
    tasksCompleted: 16,
    tasksTotal: 25,
    deadlineISO: "2026-08-02T18:00:00",
    description:
      "A 24-hour hackathon focused on building impactful AI solutions for real-world problems. Collaborate, innovate, and make a difference!",
    tags: ["AI", "Machine Learning", "Social Impact", "Education"],
  },
  {
    id: "ecobuild-sprint",
    name: "EcoBuild Sprint",
    track: "Sustainability",
    status: "Upcoming",
    dateRange: { start: "2026-08-08", end: "2026-08-09" },
    platform: "MLH",
    conflicts: 0,
    tasksCompleted: 3,
    tasksTotal: 18,
    deadlineISO: "2026-08-09T19:00:00",
    description: "Building sustainable tech solutions for a greener tomorrow.",
    tags: ["Sustainability", "IoT"],
  },
  {
    id: "campusai-jam",
    name: "CampusAI Jam",
    track: "Open Innovation",
    status: "Planning",
    dateRange: { start: "2026-08-15", end: "2026-08-16" },
    platform: "Devpost",
    conflicts: 0,
    tasksCompleted: 0,
    tasksTotal: 10,
    deadlineISO: "2026-08-16T20:00:00",
    description: "Campus-wide jam exploring creative uses of on-device AI.",
    tags: ["AI", "Mobile"],
  },
];

export const dashboardStats = {
  activeHackathons: 3,
  activeHackathonsNote: "+1 this month",
  tasksDueSoon: 7,
  tasksDueSoonNote: "next 7 days",
  upcomingDeadlines: 3,
  upcomingDeadlinesNote: "this week",
  gitConflicts: 2,
  gitConflictsNote: "need attention",
  projectFiles: 12,
  projectFilesNote: "on S3",
};

export const recentActivity = [
  {
    id: "a1",
    type: "git",
    actor: "Rohan K.",
    text: "pushed to feature/api",
    timestamp: "2026-09-19T09:58:00",
  },
  {
    id: "a2",
    type: "task",
    actor: "Aisha R.",
    text: "updated task: Design landing page",
    timestamp: "2026-09-19T09:48:00",
  },
  {
    id: "a3",
    type: "conflict",
    actor: "System",
    text: "Merge conflict detected",
    timestamp: "2026-09-19T09:32:00",
  },
  {
    id: "a4",
    type: "upload",
    actor: "Sara M.",
    text: "uploaded a file: demo_v1.mp4",
    timestamp: "2026-09-19T09:00:00",
  },
];

export const submissionChecklist = {
  hackathonId: "neurahack-2026",
  dueISO: "2026-08-02T18:00:00",
  items: [
    {
      id: "s1",
      label: "Repository link (public)",
      done: true,
      value: "https://github.com/neural-nomads/neurahack",
    },
    { id: "s2", label: "README with setup instructions", done: true },
    { id: "s3", label: "Demo video (max 3 min)", done: false, action: "upload" },
    { id: "s4", label: "Pitch deck (PDF)", done: false, action: "upload" },
    { id: "s5", label: "Deployment URL (optional)", done: false, action: "url" },
  ],
  uploadedFiles: [
    { id: "f1", name: "demo_v1.mp4", size: 48 * 1024 * 1024, uploadedAgo: "2 hours ago" },
    { id: "f2", name: "pitch_deck.pdf", size: 2.4 * 1024 * 1024, uploadedAgo: "5 hours ago" },
  ],
};
