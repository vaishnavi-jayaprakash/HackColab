// Small date helpers used across the dashboard, task board and calendar.

export function formatTimeRemaining(msRemaining) {
  if (msRemaining <= 0) return "0h 0m";
  const totalMinutes = Math.floor(msRemaining / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

export function getCountdownParts(deadlineISO) {
  const diff = new Date(deadlineISO).getTime() - Date.now();
  const clamped = Math.max(diff, 0);
  const totalMinutes = Math.floor(clamped / 60000);
  return {
    hours: Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60,
    expired: diff <= 0,
  };
}

export function formatRelativeTime(isoString) {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hr ago`;
  const diffDay = Math.round(diffHr / 24);
  return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
}

export function formatDateRange(startISO, endISO) {
  const start = new Date(startISO);
  const end = new Date(endISO);
  const opts = { month: "short", day: "numeric" };
  const sameMonth = start.getMonth() === end.getMonth();
  const startStr = start.toLocaleDateString("en-US", opts);
  const endStr = end.toLocaleDateString(
    "en-US",
    sameMonth ? { day: "numeric" } : opts
  );
  return `${startStr} \u2013 ${endStr}`;
}

export function formatShortDate(isoString) {
  return new Date(isoString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function formatDueLabel(isoString) {
  if (!isoString) return "No due date";
  return `Due ${formatShortDate(isoString)}`;
}

export function getWeekDays(anchorDate = new Date()) {
  const start = new Date(anchorDate);
  start.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i); // Today through the following six days.
    return d;
  });
}
