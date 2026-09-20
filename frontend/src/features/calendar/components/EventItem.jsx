import "./EventItem.css";

export default function EventItem({ event, color }) {
  return (
    <div className={`event-item${event.highlight ? " event-item-highlight" : ""}`} style={{ borderLeftColor: color }}>
      <p className="event-item-title">{event.title}</p>
      {event.time && <p className="event-item-time">{event.time}</p>}
    </div>
  );
}
