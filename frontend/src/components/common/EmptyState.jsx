import "./EmptyState.css";

export default function EmptyState({ title = "Nothing here yet", message, action }) {
  return (
    <div className="empty-state">
      <h4>{title}</h4>
      {message && <p>{message}</p>}
      {action}
    </div>
  );
}
