import Badge from "../../../components/ui/Badge.jsx";
import "./TaskCard.css";

export default function TaskCard({ task, onOpen }) {
  return (
    <button className="task-card" onClick={() => onOpen?.(task)}>
      <p className="task-card-title">{task.title}</p>
      <div className="task-card-meta">
        {task.tag && <Badge color={task.tag.color}>{task.tag.label}</Badge>}
        {task.subtasks && (
          <span className="task-card-subtasks">
            {task.subtasks.done}/{task.subtasks.total} subtasks
          </span>
        )}
      </div>
      <div className="task-card-footer">
        <span className="task-card-due">{task.dueLabel}</span>
        {task.assignee && <span className="task-card-avatar">{task.assignee}</span>}
      </div>
    </button>
  );
}
