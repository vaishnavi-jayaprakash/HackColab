import { classNames } from "../../utils/format.js";
import "./Spinner.css";

export default function Spinner({ size = 22, className }) {
  return (
    <span
      className={classNames("spinner", className)}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    />
  );
}
