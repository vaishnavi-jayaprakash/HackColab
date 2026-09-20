import { useState } from "react";
import Modal from "../../../components/ui/Modal.jsx";
import Input from "../../../components/ui/Input.jsx";
import Button from "../../../components/ui/Button.jsx";

export default function TaskModal({ isOpen, onClose, onCreate }) {
  const [title, setTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsSaving(true);
    try {
      await onCreate?.({ title: title.trim() });
      setTitle("");
      onClose?.();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New task">
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Input
          label="Task title"
          placeholder="e.g. Fix websocket reconnect on demo build"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSaving} disabled={!title.trim()}>
            Add to backlog
          </Button>
        </div>
      </form>
    </Modal>
  );
}
