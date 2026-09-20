import { classNames } from "../../utils/format.js";
import "./Badge.css";

const TONE_VARS = {
  success: { fg: "var(--accent-text)", bg: "var(--accent-soft)" },
  danger: { fg: "var(--danger)", bg: "var(--danger-soft)" },
  warning: { fg: "var(--warning)", bg: "var(--warning-soft)" },
  info: { fg: "var(--info)", bg: "var(--info-soft)" },
  purple: { fg: "var(--purple)", bg: "var(--purple-soft)" },
  neutral: { fg: "var(--text-secondary)", bg: "var(--surface-2)" },
};

export default function Badge({ children, tone = "neutral", className, color }) {
  const style = color
    ? { color, backgroundColor: `${color}22` }
    : { color: TONE_VARS[tone]?.fg, backgroundColor: TONE_VARS[tone]?.bg };

  return (
    <span className={classNames("badge", className)} style={style}>
      {children}
    </span>
  );
}
