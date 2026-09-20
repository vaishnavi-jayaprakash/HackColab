import { useEffect, useState } from "react";
import Modal from "../../../components/ui/Modal.jsx";
import Input from "../../../components/ui/Input.jsx";
import Button from "../../../components/ui/Button.jsx";
import "./TaskModal.css";

const PRIORITIES = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
];

const STATUSES = [
  { value: "backlog", label: "Backlog" },
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "in_review", label: "In Review" },
  { value: "done", label: "Done" },
];

const emptyForm = {
  title: "",
  description: "",
  priority: "MEDIUM",
  column: "backlog",
  assigneeId: "",
  dueDate: "",
};

export default function TaskModal({ isOpen, onClose, onSave, onDelete, task, members = [], canAssign = false }) {
  const isEdit = Boolean(task?.id);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setError("");
    if (task) {
      setForm({
        title: task.title || "",
        description: task.description || "",
        priority: task.priority || "MEDIUM",
        column: task.column || "backlog",
        assigneeId: task.assigneeId || "",
        dueDate: task.dueDate ? String(task.dueDate).slice(0, 10) : "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [isOpen, task]);

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setIsSaving(true);
    setError("");
    try {
      await onSave?.({
        title: form.title.trim(),
        description: form.description.trim(),
        priority: form.priority,
        column: form.column,
        assigneeId: form.assigneeId || null,
        dueDate: form.dueDate || null,
      });
      onClose?.();
    } catch (err) {
      setError(err.message || "Could not save task.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!task?.id || !onDelete) return;
    if (!window.confirm("Delete this task?")) return;
    setIsDeleting(true);
    setError("");
    try {
      await onDelete(task.id);
      onClose?.();
    } catch (err) {
      setError(err.message || "Could not delete task.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Edit task" : "New task"} width={520}>
      <form onSubmit={handleSubmit} className="task-modal-form">
        <Input
          label="Task title"
          placeholder="e.g. Connect GitHub repository"
          value={form.title}
          onChange={setField("title")}
          autoFocus
        />

        <label className="field">
          <span className="field-label">Description</span>
          <textarea
            className="field-input task-modal-textarea"
            rows={3}
            value={form.description}
            onChange={setField("description")}
            placeholder="Optional details"
          />
        </label>

        <div className="task-modal-row">
          <label className="field">
            <span className="field-label">Priority</span>
            <select className="field-input" value={form.priority} onChange={setField("priority")}>
              {PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field-label">Status</span>
            <select className="field-input" value={form.column} onChange={setField("column")}>
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="task-modal-row">
          <label className="field">
            <span className="field-label">Assignee</span>
            <select className="field-input" value={form.assigneeId} onChange={setField("assigneeId")} disabled={!canAssign}>
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </label>

          <Input
            label="Due date"
            type="date"
            value={form.dueDate}
            onChange={setField("dueDate")}
          />
        </div>

        {error && <p className="task-modal-error">{error}</p>}

        <div className="task-modal-actions">
          {isEdit && onDelete && (
            <Button type="button" variant="secondary" onClick={handleDelete} isLoading={isDeleting}>
              Delete
            </Button>
          )}
          <div style={{ flex: 1 }} />
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSaving} disabled={!form.title.trim()}>
            {isEdit ? "Save changes" : "Create task"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
