import TaskCard from "./TaskCard.jsx";
import "./TaskColumn.css";

export default function TaskColumn({ column, tasks, onOpenTask, onDropTask }) {
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/task-id");
    if (taskId) onDropTask?.(taskId, column.id);
  };

  return (
    <div className="task-column" onDragOver={handleDragOver} onDrop={handleDrop}>
      <div className="task-column-header">
        <span>{column.title}</span>
        <span className="task-column-count">{tasks.length}</span>
      </div>
      <div className="task-column-list">
        {tasks.map((task) => (
          <div
            key={task.id}
            draggable
            onDragStart={(e) => e.dataTransfer.setData("text/task-id", task.id)}
          >
            <TaskCard task={task} onOpen={onOpenTask} />
          </div>
        ))}
        {tasks.length === 0 && <p className="task-column-empty">Drop a task here</p>}
      </div>
    </div>
  );
}
