import Spinner from "../ui/Spinner.jsx";
import "./Loading.css";

export default function Loading({ label = "Loading…" }) {
  return (
    <div className="loading-state">
      <Spinner size={26} />
      <p>{label}</p>
    </div>
  );
}
