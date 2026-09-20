import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout.jsx";
import Card, { CardHeader } from "../components/ui/Card.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import Loading from "../components/common/Loading.jsx";
import ErrorState from "../components/common/ErrorState.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import HackathonCard from "../features/hackathons/components/HackathonCard.jsx";
import { getHackathonById, getHackathons } from "../services/hackathon.api.js";
import { getCountdownParts, formatDateRange } from "../utils/date.js";
import { formatPercent } from "../utils/format.js";
import "./Hackathon.css";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "team", label: "Team" },
  { id: "tasks", label: "Tasks" },
  { id: "deadlines", label: "Deadlines" },
  { id: "repository", label: "Repository" },
  { id: "files", label: "Files" },
];

const TAB_LINK = { tasks: "/tasks", deadlines: "/calendar", repository: "/git", files: "/submission" };

function HackathonList() {
  const [hackathons, setHackathons] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    getHackathons()
      .then((res) => {
        setHackathons(res);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  return (
    <PageLayout
      navbarContent={
        <div>
          <h1 className="page-title">Hackathons</h1>
          <p className="page-subtitle">Every hackathon your team is tracking, in one place.</p>
        </div>
      }
    >
      <div className="page">
        {status === "loading" && <Loading />}
        {status === "error" && <ErrorState onRetry={() => window.location.reload()} />}
        {status === "ready" && (
          <div className="grid hackathon-grid">
            {hackathons.map((h) => (
              <HackathonCard key={h.id} hackathon={h} />
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}

function HackathonDetail({ hackathonId }) {
  const navigate = useNavigate();
  const [hackathon, setHackathon] = useState(null);
  const [status, setStatus] = useState("loading");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    setStatus("loading");
    getHackathonById(hackathonId)
      .then((res) => {
        setHackathon(res);
        setStatus(res ? "ready" : "not-found");
      })
      .catch(() => setStatus("error"));
  }, [hackathonId]);

  if (status === "loading") return <PageLayout><Loading /></PageLayout>;
  if (status === "error") return <PageLayout><ErrorState onRetry={() => window.location.reload()} /></PageLayout>;
  if (status === "not-found")
    return (
      <PageLayout>
        <div className="page">
          <EmptyState title="Hackathon not found" action={<Button size="sm" onClick={() => navigate("/hackathons")}>Back to Hackathons</Button>} />
        </div>
      </PageLayout>
    );

  const countdown = getCountdownParts(hackathon.deadlineISO);

  return (
    <PageLayout
      navbarContent={
        <div>
          <button className="hackathon-back" onClick={() => navigate("/hackathons")}>
            ← Back to Hackathons
          </button>
          <div className="hackathon-title-row">
            <h1 className="page-title">{hackathon.name}</h1>
            <Badge tone="info">{hackathon.track}</Badge>
            <Badge tone="success">On Track</Badge>
          </div>
          <p className="page-subtitle">
            {formatDateRange(hackathon.dateRange.start, hackathon.dateRange.end)} · {hackathon.platform}
          </p>
        </div>
      }
    >
      <div className="page">
        <div className="hackathon-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`hackathon-tab${activeTab === tab.id ? " hackathon-tab-active" : ""}`}
              onClick={() => (TAB_LINK[tab.id] ? navigate(TAB_LINK[tab.id]) : setActiveTab(tab.id))}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="hackathon-overview-grid">
            <Card>
              <p className="text-muted" style={{ marginBottom: 4 }}>Time Remaining</p>
              <div className="dashboard-countdown">
                <span className="dashboard-countdown-h">{countdown.hours}<small>h</small></span>
                <span className="dashboard-countdown-m">{countdown.minutes}<small>m</small></span>
              </div>
              <div className="hackathon-card-progress-track" style={{ marginTop: 12 }}>
                <div
                  className="hackathon-card-progress-fill"
                  style={{ width: formatPercent(hackathon.tasksCompleted, hackathon.tasksTotal) }}
                />
              </div>
              <p className="text-muted" style={{ fontSize: 12, marginTop: 6 }}>
                {formatPercent(hackathon.tasksCompleted, hackathon.tasksTotal)} complete
              </p>
            </Card>

            <Card className="hackathon-banner">
              <p className="hackathon-banner-title">{hackathon.description.split(".")[0]}.</p>
              <div className="hackathon-tag-row">
                {hackathon.tags.map((tag) => (
                  <Badge key={tag} tone="neutral">{tag}</Badge>
                ))}
              </div>
            </Card>

            <Card className="hackathon-description">
              <CardHeader title="Description" />
              <p className="text-muted" style={{ lineHeight: 1.7 }}>{hackathon.description}</p>
            </Card>

            <Card>
              <CardHeader title={`Team (${hackathon.team.length})`} action={<Link className="link-btn" to="#team" onClick={() => setActiveTab("team")}>Manage</Link>} />
              <ul className="hackathon-team-list">
                {hackathon.team.map((member) => (
                  <li key={member.id} className="hackathon-team-row">
                    <span className="dashboard-avatar" style={{ background: `${member.color}33`, color: member.color, marginLeft: 0 }}>
                      {member.initials}
                    </span>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 13 }}>{member.name}</p>
                      <p className="text-muted" style={{ fontSize: 11.5 }}>{member.role}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        )}

        {activeTab === "team" && (
          <Card>
            <CardHeader title="Team" subtitle="Everyone collaborating on this hackathon." />
            <ul className="hackathon-team-list">
              {hackathon.team.map((member) => (
                <li key={member.id} className="hackathon-team-row">
                  <span className="dashboard-avatar" style={{ background: `${member.color}33`, color: member.color, marginLeft: 0 }}>
                    {member.initials}
                  </span>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 13 }}>{member.name}</p>
                    <p className="text-muted" style={{ fontSize: 11.5 }}>{member.role}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}

export default function Hackathon() {
  const { hackathonId } = useParams();
  return hackathonId ? <HackathonDetail hackathonId={hackathonId} /> : <HackathonList />;
}
