import Button from "../../../components/ui/Button.jsx";
import "./ChecklistItem.css";

export default function ChecklistItem({ item, onToggle, onAction }) {
  return (
    <li className="checklist-row">
      <label className="checklist-label">
        <input
          type="checkbox"
          checked={item.done}
          onChange={(e) => onToggle?.(item.id, e.target.checked)}
          disabled={Boolean(item.action) && !item.done}
        />
        <span className={item.done ? "checklist-text-done" : ""}>{item.label}</span>
      </label>

      {item.value && (
        <a className="checklist-link" href={item.value} target="_blank" rel="noreferrer">
          {item.value}
        </a>
      )}

      {item.action && !item.done && (
        <Button size="sm" variant="secondary" onClick={() => onAction?.(item)}>
          {item.action === "upload" ? "Upload" : "Add URL"}
        </Button>
      )}
    </li>
  );
}
