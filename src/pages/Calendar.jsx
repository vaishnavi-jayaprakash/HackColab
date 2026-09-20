import { useEffect, useState } from "react";
import PageLayout from "../components/layout/PageLayout.jsx";
import Button from "../components/ui/Button.jsx";
import Loading from "../components/common/Loading.jsx";
import ErrorState from "../components/common/ErrorState.jsx";
import EventItem from "../features/calendar/components/EventItem.jsx";
import { getCalendarEvents, getCalendarLegend } from "../services/calendar.api.js";
import { getWeekDays, formatDateRange } from "../utils/date.js";
import "./Calendar.css";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function Calendar() {
  const [events, setEvents] = useState([]);
  const [legend, setLegend] = useState([]);
  const [status, setStatus] = useState("loading");
  const weekDays = getWeekDays();

  const load = () => {
    setStatus("loading");
    Promise.all([getCalendarEvents(), getCalendarLegend()])
      .then(([e, l]) => {
        setEvents(e);
        setLegend(l);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  };

  useEffect(load, []);

  const colorFor = (hackathonId) => legend.find((l) => l.id === hackathonId)?.color || "var(--accent)";

  return (
    <PageLayout
      navbarContent={
        <div>
          <h1 className="page-title">Unified Calendar</h1>
          <p className="page-subtitle">Deadlines merged across all your hackathons.</p>
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
          <Button size="sm">+ Add Event</Button>
        </div>

        {status === "loading" && <Loading />}
        {status === "error" && <ErrorState onRetry={load} />}

        {status === "ready" && (
          <div className="calendar-grid">
            {weekDays.map((day, i) => (
              <div key={i} className="calendar-day">
                <div className="calendar-day-header">
                  <span>{DAY_LABELS[i]}</span>
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
    </PageLayout>
  );
}
