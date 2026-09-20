import Card from "../../../components/ui/Card.jsx";
import "./StatCard.css";

export default function StatCard({ label, value, note, tone = "neutral" }) {
  return (
    <Card className={`stat-card stat-card-${tone}`}>
      <p className="stat-card-label">{label}</p>
      <p className="stat-card-value">{value}</p>
      {note && <p className="stat-card-note">{note}</p>}
    </Card>
  );
}
