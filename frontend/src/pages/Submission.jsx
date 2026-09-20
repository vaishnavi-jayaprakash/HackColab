import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout.jsx";
import Card, { CardHeader } from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Modal from "../components/ui/Modal.jsx";
import Loading from "../components/common/Loading.jsx";
import ErrorState from "../components/common/ErrorState.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import ChecklistItem from "../features/submission/components/ChecklistItem.jsx";
import {
  getSubmissionChecklist,
  toggleChecklistItem,
  createChecklistItem,
  deleteChecklistItem,
} from "../services/submission.api.js";
import { uploadFile, deleteUpload } from "../services/upload.api.js";
import { formatFileSize } from "../utils/format.js";
import { formatDueLabel } from "../utils/date.js";
import "./Submission.css";

export default function Submission() {
  const { hackathonId } = useParams();
  const [checklist, setChecklist] = useState(null);
  const [status, setStatus] = useState("loading");
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [isSavingItem, setIsSavingItem] = useState(false);
  const fileInputRef = useRef(null);

  const load = () => {
    setStatus("loading");
    getSubmissionChecklist(hackathonId)
      .then((res) => {
        setChecklist(res);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  };

  useEffect(() => { load(); }, [hackathonId]);

  const handleToggle = async (itemId, done) => {
    setChecklist((prev) => ({
      ...prev,
      items: prev.items.map((i) => (i.id === itemId ? { ...i, done } : i)),
    }));
    try {
      await toggleChecklistItem(itemId, done);
    } catch {
      load();
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("Remove this checklist item?")) return;
    await deleteChecklistItem(itemId);
    load();
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setIsSavingItem(true);
    try {
      await createChecklistItem({ title: newTitle.trim() }, hackathonId);
      setNewTitle("");
      setItemModalOpen(false);
      load();
    } finally {
      setIsSavingItem(false);
    }
  };

  const handleFilePicked = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadFile(file, undefined, hackathonId);
      load();
    } catch (err) {
      alert(err.message || "Upload failed");
    }
    e.target.value = "";
  };

  const handleDeleteFile = async (uploadId) => {
    if (!window.confirm("Delete this file from S3?")) return;
    await deleteUpload(uploadId);
    load();
  };

  if (status === "loading") return <PageLayout><Loading /></PageLayout>;
  if (status === "error") return <PageLayout><ErrorState onRetry={load} /></PageLayout>;

  const doneCount = checklist.items.filter((i) => i.done).length;
  const total = checklist.items.length || 1;
  const progress = Math.round((doneCount / total) * 100);

  return (
    <PageLayout
      navbarContent={
        <div>
          <h1 className="page-title">Submission Checklist</h1>
          <p className="page-subtitle">
            {checklist.dueISO ? formatDueLabel(checklist.dueISO) : "No submission deadline set"}
          </p>
        </div>
      }
    >
      <div className="page">
        <div className="submission-progress-row">
          <span className="text-muted">
            {doneCount} / {checklist.items.length} complete
          </span>
          <div className="hackathon-card-progress-track submission-progress-track">
            <div className="hackathon-card-progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="submission-columns">
          <Card>
            <CardHeader
              title="Checklist"
              action={
                <Button size="sm" variant="secondary" onClick={() => setItemModalOpen(true)}>
                  + Item
                </Button>
              }
            />
            {checklist.items.length === 0 ? (
              <EmptyState title="No checklist items" message="Add items your team must complete before submit." />
            ) : (
              <ul>
                {checklist.items.map((item) => (
                  <ChecklistItem
                    key={item.id}
                    item={item}
                    onToggle={handleToggle}
                    onDelete={handleDeleteItem}
                  />
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <CardHeader
              title="Uploaded Files"
              subtitle={`${checklist.uploadedFiles.length} files`}
              action={
                <Button size="sm" onClick={() => fileInputRef.current?.click()}>
                  Upload
                </Button>
              }
            />
            <input ref={fileInputRef} type="file" hidden onChange={handleFilePicked} />
            {checklist.uploadedFiles.length === 0 ? (
              <EmptyState title="No files uploaded yet" message="Upload project assets to S3." />
            ) : (
              <ul className="submission-file-list">
                {checklist.uploadedFiles.map((file) => (
                  <li key={file.id} className="submission-file-row">
                    <span className="submission-file-icon">📎</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="submission-file-name">{file.name}</p>
                      <p className="text-muted" style={{ fontSize: 11.5 }}>
                        {formatFileSize(typeof file.size === "number" ? file.size : 0)} · {file.uploadedAgo}
                      </p>
                    </div>
                    <Button size="sm" variant="secondary" onClick={() => handleDeleteFile(file.id)}>
                      Delete
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      <Modal isOpen={itemModalOpen} onClose={() => setItemModalOpen(false)} title="Add checklist item">
        <form onSubmit={handleAddItem} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Input
            label="Title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="e.g. Demo video"
            autoFocus
          />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <Button type="button" variant="secondary" onClick={() => setItemModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSavingItem} disabled={!newTitle.trim()}>
              Add
            </Button>
          </div>
        </form>
      </Modal>
    </PageLayout>
  );
}
