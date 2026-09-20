import { classNames } from "../../utils/format.js";
import "./Button.css";

const VARIANT_CLASS = {
  primary: "btn btn-primary",
  secondary: "btn btn-secondary",
  ghost: "btn btn-ghost",
  danger: "btn btn-danger",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  icon,
  fullWidth = false,
  isLoading = false,
  disabled = false,
  className,
  ...rest
}) {
  return (
    <button
      className={classNames(
        VARIANT_CLASS[variant] || VARIANT_CLASS.primary,
        `btn-${size}`,
        fullWidth && "btn-full",
        className
      )}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading ? <span className="btn-spinner" aria-hidden /> : icon}
      <span>{children}</span>
    </button>
  );
}
