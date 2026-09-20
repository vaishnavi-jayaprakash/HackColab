import Badge from "../../../components/ui/Badge.jsx";
import "./ConflictAlert.css";

const SEVERITY_TONE = { high: "danger", medium: "warning", low: "info" };

export default function ConflictAlert({ conflict }) {
  return (
    <div className="conflict-row">
      <div>
        <p className="conflict-branches">{conflict.branches}</p>
        <p className="conflict-file">{conflict.file}</p>
      </div>
      <Badge tone={SEVERITY_TONE[conflict.severity] || "neutral"}>{conflict.severity}</Badge>
    </div>
  );
}
