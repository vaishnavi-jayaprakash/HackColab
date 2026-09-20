import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout.jsx";
import Card, { CardHeader } from "../components/ui/Card.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Modal from "../components/ui/Modal.jsx";
import Loading from "../components/common/Loading.jsx";
import ErrorState from "../components/common/ErrorState.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import HackathonCard from "../features/hackathons/components/HackathonCard.jsx";
import {
  getHackathonById,
  getHackathons,
  createHackathonWithTeam,
} from "../services/hackathon.api.js";
import { getCountdownParts, formatDateRange } from "../utils/date.js";
import { formatPercent } from "../utils/format.js";
import { useAuth } from "../hooks/useAuth.js";
import {
  addTeamMember,
  deleteTeam,
  getTeamInvitations,
  inviteTeamMember,
  removeTeamMember,
} from "../services/team.api.js";
import "./Hackathon.css";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "team", label: "Team" },
  { id: "tasks", label: "Tasks" },
  { id: "deadlines", label: "Deadlines" },
  { id: "repository", label: "Repository" },
  { id: "files", label: "Files" },
];

const TAB_LINK = { tasks: "tasks", deadlines: "calendar", repository: "git", files: "submission" };

function HackathonList() {
  const navigate = useNavigate();
  const [hackathons, setHackathons] = useState([]);
  const [status, setStatus] = useState("loading");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    teamName: "",
    startDate: "",
    endDate: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const load = () => {
    setStatus("loading");
    getHackathons()
      .then((res) => {
        setHackathons(res);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  };

  useEffect(load, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.startDate || !form.endDate) {
      setFormError("Name, start date and end date are required.");
      return;
    }
    setIsSaving(true);
    setFormError("");
    try {
      const { hackathon } = await createHackathonWithTeam({
        name: form.name.trim(),
        description: form.description.trim(),
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        submissionDeadline: new Date(form.endDate).toISOString(),
        teamName: form.teamName.trim() || "Primary team",
        status: "ACTIVE",
      });
      setModalOpen(false);
      navigate(`/hackathons/${hackathon.id}`);
    } catch (err) {
      setFormError(err.message || "Could not create hackathon");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageLayout
      navbarContent={
        <div>
          <h1 className="page-title">Hackathons</h1>
          <p className="page-subtitle">Hackathons stored in your database.</p>
        </div>
      }
    >
      <div className="page">
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
          <Button onClick={() => setModalOpen(true)}>+ New Hackathon</Button>
        </div>

        {status === "loading" && <Loading />}
        {status === "error" && <ErrorState onRetry={load} />}
        {status === "ready" && hackathons.length === 0 && (
          <EmptyState
            title="No hackathons yet"
            message="Create a hackathon and team to start using tasks, git and submissions."
            action={<Button size="sm" onClick={() => setModalOpen(true)}>Create hackathon</Button>}
          />
        )}
        {status === "ready" && hackathons.length > 0 && (
          <div className="grid hackathon-grid">
            {hackathons.map((h) => (
              <HackathonCard key={h.id} hackathon={h} />
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create hackathon" width={520}>
        <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Input
            label="Hackathon name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="e.g. NeuraHack 2026"
          />
          <Input
            label="Team name"
            value={form.teamName}
            onChange={(e) => setForm((f) => ({ ...f, teamName: e.target.value }))}
            placeholder="e.g. Neural Nomads"
          />
          <Input
            label="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <Input
            label="Start"
            type="datetime-local"
            value={form.startDate}
            onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
          />
          <Input
            label="End / submission"
            type="datetime-local"
            value={form.endDate}
            onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
          />
          {formError && <p style={{ color: "var(--danger)", margin: 0 }}>{formError}</p>}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSaving}>
              Create
            </Button>
          </div>
        </form>
      </Modal>
    </PageLayout>
  );
}

function HackathonDetail({ hackathonId }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hackathon, setHackathon] = useState(null);
  const [status, setStatus] = useState("loading");
  const [activeTab, setActiveTab] = useState("overview");
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [memberAction, setMemberAction] = useState("add");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberError, setMemberError] = useState("");
  const [isSavingMember, setIsSavingMember] = useState(false);
  const [invitations, setInvitations] = useState([]);

  const load = async () => {
    setStatus("loading");
    let res;
    try {
      res = await getHackathonById(hackathonId);
    } catch {
      setStatus("error");
      return;
    }

    setHackathon(res);
    setStatus(res ? "ready" : "not-found");

    // Invitations are supplementary lead-only data. A stale backend or an
    // unapplied invitation migration must never prevent the hackathon itself
    // from opening.
    if (res?.teamId && res.teamLeadId === user?.id) {
      try {
        setInvitations(await getTeamInvitations(res.teamId));
      } catch {
        setInvitations([]);
      }
    } else {
      setInvitations([]);
    }
  };

  useEffect(() => { load(); }, [hackathonId, user?.id]);

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
  const description = hackathon.description || "No description provided.";
  const tags = hackathon.tags || [];
  const team = hackathon.team || [];
  const isLead = hackathon.teamLeadId === user?.id;

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberEmail.trim()) return;
    setIsSavingMember(true);
    setMemberError("");
    try {
      if (memberAction === "invite") {
        await inviteTeamMember(hackathon.teamId, memberEmail.trim());
      } else {
        await addTeamMember(hackathon.teamId, { email: memberEmail.trim() });
      }
      setMemberEmail("");
      setMemberModalOpen(false);
      load();
    } catch (err) {
      setMemberError(err.message || "Could not add this member.");
    } finally {
      setIsSavingMember(false);
    }
  };

  const openMemberModal = (action) => {
    setMemberAction(action);
    setMemberEmail("");
    setMemberError("");
    setMemberModalOpen(true);
  };

  const handleRemoveMember = async (member) => {
    if (!window.confirm(`Remove ${member.name} from this team?`)) return;
    try {
      await removeTeamMember(hackathon.teamId, member.id);
      load();
    } catch (err) {
      alert(err.message || "Could not remove this member.");
    }
  };

  const handleDeleteTeam = async () => {
    if (!window.confirm("Delete this team and all of its tasks, submissions, repository records, and uploads? This cannot be undone.")) return;
    try {
      await deleteTeam(hackathon.teamId);
      navigate("/hackathons");
    } catch (err) {
      alert(err.message || "Could not delete this team.");
    }
  };

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
            <Badge tone="success">{hackathon.status}</Badge>
          </div>
          <p className="page-subtitle">
            {formatDateRange(hackathon.dateRange.start, hackathon.dateRange.end)}
            {hackathon.platform ? ` · ${hackathon.platform}` : ""}
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
              onClick={() => (TAB_LINK[tab.id] ? navigate(`/hackathons/${hackathonId}/${TAB_LINK[tab.id]}`) : setActiveTab(tab.id))}
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
              <p className="hackathon-banner-title">
                {description.includes(".") ? `${description.split(".")[0]}.` : description}
              </p>
              {tags.length > 0 && (
                <div className="hackathon-tag-row">
                  {tags.map((tag) => (
                    <Badge key={tag} tone="neutral">{tag}</Badge>
                  ))}
                </div>
              )}
            </Card>

            <Card className="hackathon-description">
              <CardHeader title="Description" />
              <p className="text-muted" style={{ lineHeight: 1.7 }}>{description}</p>
            </Card>

            <Card>
              <CardHeader
                title={`Team (${team.length})`}
                action={
                  <Link className="link-btn" to="#team" onClick={() => setActiveTab("team")}>
                    View
                  </Link>
                }
              />
              <ul className="hackathon-team-list">
                {team.map((member) => (
                  <li key={member.id} className="hackathon-team-row">
                    <span
                      className="dashboard-avatar"
                      style={{ background: `${member.color}33`, color: member.color, marginLeft: 0 }}
                    >
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
            <CardHeader
              title="Team"
              subtitle="Members of this hackathon team."
              action={isLead ? (
                <div style={{ display: "flex", gap: 8 }}>
                  <Button size="sm" variant="secondary" onClick={() => openMemberModal("add")}>+ Add member</Button>
                  <Button size="sm" onClick={() => openMemberModal("invite")}>Invite new member</Button>
                </div>
              ) : null}
            />
            {team.length === 0 ? (
              <EmptyState title="No members yet" />
            ) : (
              <ul className="hackathon-team-list">
                {team.map((member) => (
                  <li key={member.id} className="hackathon-team-row">
                    <span
                      className="dashboard-avatar"
                      style={{ background: `${member.color}33`, color: member.color, marginLeft: 0 }}
                    >
                      {member.initials}
                    </span>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 13 }}>{member.name}</p>
                      <p className="text-muted" style={{ fontSize: 11.5 }}>{member.role}</p>
                    </div>
                    {isLead && member.id !== user?.id && (
                      <Button size="sm" variant="secondary" onClick={() => handleRemoveMember(member)}>
                        Remove
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            )}
            {isLead && (
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 18 }}>
                <Button size="sm" variant="secondary" onClick={handleDeleteTeam}>Delete team</Button>
              </div>
            )}
            {isLead && invitations.length > 0 && (
              <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
                <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Pending invitations</p>
                {invitations.map((invitation) => (
                  <p key={invitation.id} className="text-muted" style={{ fontSize: 12, margin: "4px 0" }}>
                    {invitation.email}
                  </p>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>

      <Modal
        isOpen={memberModalOpen}
        onClose={() => setMemberModalOpen(false)}
        title={memberAction === "invite" ? "Invite new member" : "Add registered member"}
      >
        <form onSubmit={handleAddMember} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Input
            label="Account email"
            type="email"
            value={memberEmail}
            onChange={(e) => setMemberEmail(e.target.value)}
            placeholder="member@example.com"
            autoFocus
          />
          <p className="text-muted" style={{ margin: 0, fontSize: 12 }}>
            {memberAction === "invite"
              ? "They will be added to this team automatically when they sign up with this email."
              : "Use the email address of an existing HackColab account."}
          </p>
          {memberError && <p style={{ color: "var(--danger)", margin: 0 }}>{memberError}</p>}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <Button type="button" variant="secondary" onClick={() => setMemberModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={isSavingMember} disabled={!memberEmail.trim()}>
              {memberAction === "invite" ? "Send invitation" : "Add member"}
            </Button>
          </div>
        </form>
      </Modal>
    </PageLayout>
  );
}

export default function Hackathon() {
  const { hackathonId } = useParams();
  return hackathonId ? <HackathonDetail hackathonId={hackathonId} /> : <HackathonList />;
}
