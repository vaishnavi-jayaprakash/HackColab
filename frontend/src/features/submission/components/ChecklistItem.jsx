import Button from "../../../components/ui/Button.jsx";
import "./ChecklistItem.css";

export default function ChecklistItem({ item, onToggle, onDelete }) {
  return (
    <li className="checklist-row">
      <label className="checklist-label">
        <input
          type="checkbox"
          checked={item.done}
          onChange={(e) => onToggle?.(item.id, e.target.checked)}
        />
        <span className={item.done ? "checklist-text-done" : ""}>{item.label}</span>
      </label>

      {item.description && (
        <p className="text-muted" style={{ fontSize: 12, margin: "0 0 0 28px" }}>
          {item.description}
        </p>
      )}

      {onDelete && (
        <Button size="sm" variant="secondary" onClick={() => onDelete(item.id)}>
          Remove
        </Button>
      )}
    </li>
  );
}
