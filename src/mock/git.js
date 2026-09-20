export const repository = {
  name: "neural-nomads/neurahack",
  url: "https://github.com/neural-nomads/neurahack",
  lastSynced: "5 min ago",
  branchCount: 12,
  openPRs: 4,
  potentialConflicts: 2,
};

export const recentCommits = [
  { id: "c1", author: "Rohan K.", initials: "RK", message: "feat: add voice input pipeline", timestamp: "2 min ago" },
  { id: "c2", author: "Sara M.", initials: "SM", message: "fix: landing page animation", timestamp: "12 min ago" },
  { id: "c3", author: "Theo J.", initials: "TJ", message: "refactor: audio buffer", timestamp: "1 hr ago" },
];

export const conflictRadar = [
  {
    id: "conf1",
    branches: "feature/voice-input \u2194 fix/audio-buffer",
    file: "src/audio/stream.ts",
    severity: "high",
  },
  {
    id: "conf2",
    branches: "feature/leaderboard \u2194 main",
    file: "src/components/leaderboard.tsx",
    severity: "medium",
  },
  {
    id: "conf3",
    branches: "rohan/carbon-model \u2194 tara/carbon-ui",
    file: "lib/models/carbon.py",
    severity: "low",
  },
];
