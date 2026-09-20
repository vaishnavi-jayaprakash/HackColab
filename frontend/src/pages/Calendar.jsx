import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Modal from "../components/ui/Modal.jsx";
import Loading from "../components/common/Loading.jsx";
import ErrorState from "../components/common/ErrorState.jsx";
import EventItem from "../features/calendar/components/EventItem.jsx";
import { getCalendarEvents, getCalendarLegend, createEvent } from "../services/calendar.api.js";
import { getWeekDays, formatDateRange } from "../utils/date.js";
import "./Calendar.css";

export default function Calendar() {
  const { hackathonId } = useParams();
  const [events, setEvents] = useState([]);
  const [legend, setLegend] = useState([]);
  const [status, setStatus] = useState("loading");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: "", deadlineAt: "", type: "INTERNAL" });
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const weekDays = getWeekDays();

  const load = () => {
    setStatus("loading");
    Promise.all([getCalendarEvents(hackathonId), getCalendarLegend(hackathonId)])
      .then(([e, l]) => {
        setEvents(e);
        setLegend(l);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  };

  useEffect(() => { load(); }, [hackathonId]);

  const colorFor = (hackathonId) => legend.find((l) => l.id === hackathonId)?.color || "var(--accent)";

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.deadlineAt) {
      setFormError("Title and date/time are required.");
      return;
    }
    setIsSaving(true);
    setFormError("");
    try {
      await createEvent({
        hackathonId,
        title: form.title.trim(),
        deadlineAt: new Date(form.deadlineAt).toISOString(),
        type: form.type,
      });
      setModalOpen(false);
      setForm({ title: "", deadlineAt: "", type: "INTERNAL" });
      load();
    } catch (err) {
      setFormError(err.message || "Could not create deadline");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageLayout
      navbarContent={
        <div>
          <h1 className="page-title">Unified Calendar</h1>
          <p className="page-subtitle">Deadlines from today through the next seven days.</p>
        </div>
      }
    >
      <div className="page">
        <div className="calendar-toolbar">
          <div className="calendar-legend">
            {legend.map((item) => (
              <span key={item.id} className="calendar-legend-item">
                <span className="dot" style={{ background: item.color }} />
                {item.label}
              </span>
            ))}
          </div>
          <div className="calendar-range">
            {formatDateRange(weekDays[0].toISOString(), weekDays[6].toISOString())}
          </div>
          <Button size="sm" onClick={() => setModalOpen(true)}>
            + Add Deadline
          </Button>
        </div>

        {status === "loading" && <Loading />}
        {status === "error" && <ErrorState onRetry={load} />}

        {status === "ready" && (
          <div className="calendar-grid">
            {weekDays.map((day, i) => (
              <div key={day.toISOString()} className="calendar-day">
                <div className="calendar-day-header">
                  <span>{day.toLocaleDateString("en-US", { weekday: "short" })}</span>
                  <span className="calendar-day-number">{day.getDate()}</span>
                </div>
                <div className="calendar-day-body">
                  {events
                    .filter((e) => e.dayIndex === i)
                    .map((event) => (
                      <EventItem key={event.id} event={event} color={colorFor(event.hackathonId)} />
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add deadline">
        <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Input
            label="Title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="e.g. Submission deadline"
          />
          <Input
            label="Date & time"
            type="datetime-local"
            value={form.deadlineAt}
            onChange={(e) => setForm((f) => ({ ...f, deadlineAt: e.target.value }))}
          />
          <label className="field">
            <span className="field-label">Type</span>
            <select
              className="field-input"
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
            >
              <option value="INTERNAL">Internal</option>
              <option value="SUBMISSION">Submission</option>
              <option value="MILESTONE">Milestone</option>
            </select>
          </label>
          {formError && <p style={{ color: "var(--danger)", margin: 0 }}>{formError}</p>}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSaving}>
              Create
            </Button>
          </div>
        </form>
      </Modal>
    </PageLayout>
  );
}
