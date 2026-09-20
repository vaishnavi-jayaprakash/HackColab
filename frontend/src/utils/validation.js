// Lightweight form validation helpers. Keep dependency-free for now;
// swap for a schema library later if the form surface grows.

export function isValidEmail(value = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isRequired(value) {
  return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
}

export function minLength(value = "", length) {
  return value.trim().length >= length;
}

export function validateLoginForm({ email, password }) {
  const errors = {};
  if (!isRequired(email)) errors.email = "Email is required.";
  else if (!isValidEmail(email)) errors.email = "Enter a valid email address.";

  if (!isRequired(password)) errors.password = "Password is required.";
  else if (!minLength(password, 6))
    errors.password = "Password must be at least 6 characters.";

  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateSignupForm({ name, email, password }) {
  const { errors } = validateLoginForm({ email, password });
  if (!isRequired(name)) errors.name = "Name is required.";
  return { isValid: Object.keys(errors).length === 0, errors };
}
