import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout.jsx";
import Card, { CardHeader } from "../components/ui/Card.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import Loading from "../components/common/Loading.jsx";
import ErrorState from "../components/common/ErrorState.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import StatCard from "../features/dashboard/components/StatCard.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { getDashboardSummary } from "../services/hackathon.api.js";
import { getCountdownParts, formatRelativeTime } from "../utils/date.js";
import { formatPercent as pct } from "../utils/format.js";
import "./Dashboard.css";

const ACTIVITY_ICON = { git: "🔀", task: "📝", conflict: "⚠️", upload: "📎" };

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");

  const load = () => {
    setStatus("loading");
    getDashboardSummary()
      .then((res) => {
        setData(res);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  };

  useEffect(load, []);

  if (status === "loading") return <PageLayout><Loading label="Loading your dashboard…" /></PageLayout>;
  if (status === "error") {
    return (
      <PageLayout>
        <ErrorState
          title="Could not load dashboard"
          message="Make sure the backend is running and you belong to a team. Create a hackathon under Hackathons if needed."
          onRetry={load}
        />
      </PageLayout>
    );
  }

  const { stats, hackathons, recentActivity, teamMembers = [] } = data;
  const featured = hackathons[0];
  if (!featured) {
    return (
      <PageLayout
        navbarContent={
          <div>
            <h1 className="page-title">Welcome, {user?.name?.split(" ")[0]}</h1>
            <p className="page-subtitle">You have not joined a team yet.</p>
          </div>
        }
      >
        <div className="page">
          <div className="grid dashboard-stats">
            <StatCard label="Active Hackathons" value={stats.activeHackathons} note={stats.activeHackathonsNote} />
            <StatCard label="Tasks Due Soon" value={stats.tasksDueSoon} note={stats.tasksDueSoonNote} />
            <StatCard label="Upcoming Deadlines" value={stats.upcomingDeadlines} note={stats.upcomingDeadlinesNote} />
            <StatCard label="Git Conflicts" value={stats.gitConflicts} note={stats.gitConflictsNote} tone="danger" />
            <StatCard label="Project Files" value={stats.projectFiles} note={stats.projectFilesNote} />
          </div>
          <EmptyState
            title="No team workspace yet"
            message="Ask a team lead to add or invite you, or create a hackathon and team of your own."
            action={<Button size="sm" onClick={() => navigate("/hackathons")}>Go to Hackathons</Button>}
          />
        </div>
      </PageLayout>
    );
  }
  const countdown = getCountdownParts(featured.deadlineISO);

  return (
    <PageLayout
      navbarContent={
        <div>
          <h1 className="page-title">Good evening, {user?.name?.split(" ")[0]} 👋</h1>
          <p className="page-subtitle">
            {stats.activeHackathons} active hackathons · {stats.tasksDueSoon} tasks due this week ·{" "}
            {stats.gitConflicts} merge conflicts need attention
          </p>
        </div>
      }
    >
      <div className="page">
        <div className="grid dashboard-stats">
          <StatCard label="Active Hackathons" value={stats.activeHackathons} note={stats.activeHackathonsNote} />
          <StatCard label="Tasks Due Soon" value={stats.tasksDueSoon} note={stats.tasksDueSoonNote} />
          <StatCard label="Upcoming Deadlines" value={stats.upcomingDeadlines} note={stats.upcomingDeadlinesNote} />
          <StatCard label="Git Conflicts" value={stats.gitConflicts} note={stats.gitConflictsNote} tone="danger" />
          <StatCard label="Project Files" value={stats.projectFiles} note={stats.projectFilesNote} />
        </div>

        <div className="dashboard-columns">
          <Card className="dashboard-featured" onClick={() => navigate(`/hackathons/${featured.id}`)}>
            <div className="dashboard-featured-top">
              <div className="dashboard-featured-icon">⚡</div>
              <div style={{ flex: 1 }}>
                <div className="dashboard-featured-title-row">
                  <p className="dashboard-featured-name">{featured.name}</p>
                  <Badge tone="danger">{featured.conflicts} conflicts</Badge>
                </div>
                <p className="dashboard-featured-track">{featured.track}</p>
              </div>
            </div>

            <div className="dashboard-countdown">
              <span className="dashboard-countdown-h">{countdown.hours}<small>h</small></span>
              <span className="dashboard-countdown-m">{countdown.minutes}<small>m</small></span>
              <span className="text-muted">remaining</span>
            </div>

            <div className="dashboard-progress-row">
              <div className="hackathon-card-progress-track">
                <div
                  className="hackathon-card-progress-fill"
                  style={{ width: pct(featured.tasksCompleted, featured.tasksTotal) }}
                />
              </div>
              <span className="text-muted" style={{ fontSize: 12 }}>
                {featured.tasksCompleted} / {featured.tasksTotal} tasks completed ·{" "}
                {pct(featured.tasksCompleted, featured.tasksTotal)}
              </span>
            </div>

            <div className="dashboard-featured-footer">
              <div className="dashboard-avatar-stack">
                {teamMembers.slice(0, 3).map((m) => (
                  <span key={m.id} className="dashboard-avatar" style={{ background: `${m.color}33`, color: m.color }}>
                    {m.initials}
                  </span>
                ))}
                {teamMembers.length > 3 && <span className="dashboard-avatar dashboard-avatar-more">+{teamMembers.length - 3}</span>}
              </div>
              <Button size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/hackathons/${featured.id}`); }}>
                View Hackathon →
              </Button>
            </div>
          </Card>

            <Card className="dashboard-activity">
            <CardHeader title="Recent Activity" />
            <ul className="activity-list">
              {recentActivity.length === 0 ? (
                <li className="activity-row">
                  <div className="activity-body">
                    <p className="text-muted">No recent activity yet.</p>
                  </div>
                </li>
              ) : (
                recentActivity.map((item) => (
                  <li key={item.id} className="activity-row">
                    <span className="activity-icon">{ACTIVITY_ICON[item.type] || "•"}</span>
                    <div className="activity-body">
                      <p>
                        <strong>{item.actor}</strong> {item.text}
                      </p>
                      <p className="activity-time">{formatRelativeTime(item.timestamp)}</p>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
