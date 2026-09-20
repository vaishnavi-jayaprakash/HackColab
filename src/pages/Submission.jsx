import { useEffect, useRef, useState } from "react";
import PageLayout from "../components/layout/PageLayout.jsx";
import Card, { CardHeader } from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import Loading from "../components/common/Loading.jsx";
import ErrorState from "../components/common/ErrorState.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import ChecklistItem from "../features/submission/components/ChecklistItem.jsx";
import {
  getSubmissionChecklist,
  submitProject,
  toggleChecklistItem,
} from "../services/submission.api.js";
import { uploadFile } from "../services/upload.api.js";
import { formatFileSize } from "../utils/format.js";
import { formatDueLabel } from "../utils/date.js";
import "./Submission.css";

export default function Submission() {
  const [checklist, setChecklist] = useState(null);
  const [status, setStatus] = useState("loading");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef(null);

  const load = () => {
    setStatus("loading");
    getSubmissionChecklist("neurahack-2026")
      .then((res) => {
        setChecklist(res);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  };

  useEffect(load, []);

  const handleToggle = async (itemId, done) => {
    setChecklist((prev) => ({
      ...prev,
      items: prev.items.map((i) => (i.id === itemId ? { ...i, done } : i)),
    }));
    await toggleChecklistItem(itemId, done);
  };

  const handleAction = (item) => {
    if (item.action === "upload") fileInputRef.current?.click();
    else if (item.action === "url") {
      const url = window.prompt("Paste your deployment URL");
      if (url) handleToggle(item.id, true);
    }
  };

  const handleFilePicked = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const uploaded = await uploadFile(file);
    setChecklist((prev) => ({
      ...prev,
      uploadedFiles: [{ ...uploaded }, ...prev.uploadedFiles],
      items: prev.items.map((i) => (i.action === "upload" && !i.done ? { ...i, done: true } : i)),
    }));
    e.target.value = "";
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await submitProject("neurahack-2026");
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") return <PageLayout><Loading /></PageLayout>;
  if (status === "error") return <PageLayout><ErrorState onRetry={load} /></PageLayout>;

  const doneCount = checklist.items.filter((i) => i.done).length;
  const total = checklist.items.length;
  const progress = Math.round((doneCount / total) * 100);

  return (
    <PageLayout
      navbarContent={
        <div>
          <h1 className="page-title">Submission Checklist — NeuraHack 2026</h1>
          <p className="page-subtitle">{formatDueLabel(checklist.dueISO)}</p>
        </div>
      }
    >
      <div className="page">
        <div className="submission-progress-row">
          <span className="text-muted">{doneCount} / {total} complete</span>
          <div className="hackathon-card-progress-track submission-progress-track">
            <div className="hackathon-card-progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="submission-columns">
          <Card>
            <CardHeader title="Checklist" />
            <ul>
              {checklist.items.map((item) => (
                <ChecklistItem key={item.id} item={item} onToggle={handleToggle} onAction={handleAction} />
              ))}
            </ul>
            <input
              ref={fileInputRef}
              type="file"
              hidden
              onChange={handleFilePicked}
              accept=".mp4,.mov,.pdf"
            />
          </Card>

          <Card>
            <CardHeader title="Uploaded Files" subtitle={`${checklist.uploadedFiles.length} files`} />
            {checklist.uploadedFiles.length === 0 ? (
              <EmptyState title="No files uploaded yet" message="Upload your demo video and pitch deck from the checklist." />
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
                  </li>
                ))}
              </ul>
            )}

            <Button
              fullWidth
              className="submission-submit-btn"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              disabled={submitted || progress < 60}
            >
              {submitted ? "Submitted ✓" : "Submit on Devpost →"}
            </Button>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
