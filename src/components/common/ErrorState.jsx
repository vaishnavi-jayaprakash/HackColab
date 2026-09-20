import Button from "../ui/Button.jsx";
import "./ErrorState.css";

export default function ErrorState({
  title = "Something went wrong",
  message = "That request didn't go through. Check your connection and try again.",
  onRetry,
}) {
  return (
    <div className="error-state">
      <div className="error-state-icon">!</div>
      <h4>{title}</h4>
      <p>{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
