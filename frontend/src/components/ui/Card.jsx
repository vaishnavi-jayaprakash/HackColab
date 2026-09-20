import { classNames } from "../../utils/format.js";
import "./Card.css";

export default function Card({ children, className, padded = true, hoverable = false, ...rest }) {
  return (
    <div
      className={classNames("card", padded && "card-padded", hoverable && "card-hoverable", className)}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, className }) {
  return (
    <div className={classNames("card-header", className)}>
      <div>
        <h3 className="card-title">{title}</h3>
        {subtitle && <p className="card-subtitle">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
