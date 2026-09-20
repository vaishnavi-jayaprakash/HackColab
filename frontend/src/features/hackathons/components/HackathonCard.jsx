import { useNavigate } from "react-router-dom";
import Card from "../../../components/ui/Card.jsx";
import Badge from "../../../components/ui/Badge.jsx";
import { formatDateRange, getCountdownParts } from "../../../utils/date.js";
import "./HackathonCard.css";

const STATUS_TONE = { "On Track": "success", Upcoming: "info", Planning: "neutral" };

export default function HackathonCard({ hackathon }) {
  const navigate = useNavigate();
  const { hours, minutes, expired } = getCountdownParts(hackathon.deadlineISO);
  const total = hackathon.tasksTotal || 0;
  const done = hackathon.tasksCompleted || 0;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <Card
      hoverable
      className="hackathon-card"
      onClick={() => navigate(`/hackathons/${hackathon.id}`)}
      role="button"
      tabIndex={0}
    >
      <div className="hackathon-card-top">
        <div>
          <p className="hackathon-card-name">{hackathon.name}</p>
          <p className="hackathon-card-track">{hackathon.track}</p>
        </div>
        <Badge tone={STATUS_TONE[hackathon.status] || "neutral"}>{hackathon.status}</Badge>
      </div>

      <p className="hackathon-card-dates">
        {formatDateRange(hackathon.dateRange.start, hackathon.dateRange.end)}
        {hackathon.platform ? ` · ${hackathon.platform}` : ""}
      </p>

      <div className="hackathon-card-countdown">
        {expired ? "Deadline passed" : `${hours}h ${minutes}m remaining`}
      </div>

      <div className="hackathon-card-progress-track">
        <div className="hackathon-card-progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <p className="hackathon-card-progress-label">
        {done}/{total} tasks completed · {progress}%
      </p>
    </Card>
  );
}
