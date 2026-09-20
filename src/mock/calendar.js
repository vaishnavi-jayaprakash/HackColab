export const calendarLegend = [
  { id: "neurahack-2026", label: "NeuraHack 2026", color: "#22c55e" },
  { id: "ecobuild-sprint", label: "EcoBuild Sprint", color: "#c084fc" },
  { id: "campusai-jam", label: "CampusAI Jam", color: "#60a5fa" },
  { id: "other", label: "Other", color: "#8b95ac" },
];

// dayIndex: 0 = Monday ... 6 = Sunday, for the currently displayed week.
export const calendarEvents = [
  {
    id: "e1",
    title: "Registration closes",
    hackathonId: "ecobuild-sprint",
    dayIndex: 0,
    time: "10:00 AM",
  },
  {
    id: "e2",
    title: "Team formation ends",
    hackathonId: "campusai-jam",
    dayIndex: 1,
    time: "",
  },
  {
    id: "e3",
    title: "Internal review",
    hackathonId: "neurahack-2026",
    dayIndex: 2,
    time: "5:00 PM",
  },
  {
    id: "e4",
    title: "MVP freeze",
    hackathonId: "neurahack-2026",
    dayIndex: 3,
    time: "All day",
  },
  {
    id: "e5",
    title: "Pitch check",
    hackathonId: "neurahack-2026",
    dayIndex: 4,
    time: "6:00 PM",
  },
  {
    id: "e6",
    title: "Submission deadline",
    hackathonId: "neurahack-2026",
    dayIndex: 5,
    time: "6:00 PM",
    highlight: true,
  },
  {
    id: "e7",
    title: "Judging round 1",
    hackathonId: "ecobuild-sprint",
    dayIndex: 5,
    time: "7:00 PM",
  },
];
