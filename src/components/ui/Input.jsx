import { forwardRef, useState } from "react";
import { classNames } from "../../utils/format.js";
import "./Input.css";

const Input = forwardRef(function Input(
  { label, error, hint, type = "text", trailing, className, ...rest },
  ref
) {
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === "password";
  const resolvedType = isPassword && revealed ? "text" : type;

  return (
    <label className={classNames("field", className)}>
      {label && <span className="field-label">{label}</span>}
      <span className="field-control">
        <input ref={ref} type={resolvedType} className={classNames("field-input", error && "field-input-error")} {...rest} />
        {isPassword && (
          <button
            type="button"
            className="field-trailing"
            onClick={() => setRevealed((v) => !v)}
            tabIndex={-1}
          >
            {revealed ? "Hide" : "Show"}
          </button>
        )}
        {!isPassword && trailing && <span className="field-trailing">{trailing}</span>}
      </span>
      {error ? <span className="field-error">{error}</span> : hint ? <span className="field-hint">{hint}</span> : null}
    </label>
  );
});

export default Input;
