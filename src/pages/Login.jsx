import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../components/ui/Input.jsx";
import Button from "../components/ui/Button.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { validateLoginForm, validateSignupForm } from "../utils/validation.js";
import "./Login.css";

export default function Login() {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const { login, signup, loginWithProvider } = useAuth();
  const navigate = useNavigate();

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    const { isValid, errors: nextErrors } =
      mode === "login" ? validateLoginForm(form) : validateSignupForm(form);
    setErrors(nextErrors);
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      if (mode === "login") await login(form);
      else await signup(form);
      navigate("/dashboard");
    } catch (err) {
      setFormError(err.message || "Something went wrong. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProvider = async (provider) => {
    setFormError("");
    try {
      await loginWithProvider(provider);
      navigate("/dashboard");
    } catch (err) {
      setFormError(err.message || "Could not sign in with " + provider);
    }
  };

  return (
    <div className="login-page">
      <div className="login-hero">
        <div className="login-hero-brand">
          <span className="login-hero-mark">⚡</span>
          <div>
            <p className="login-hero-title">HackColab</p>
            <p className="login-hero-tagline">Build together. Win together.</p>
          </div>
        </div>

        <h1 className="login-hero-heading">One workspace for all your hackathons.</h1>
        <p className="login-hero-copy">
          Manage tasks, deadlines, teamwork and submissions — all in one place.
        </p>
        <p className="login-hero-footnote">Ideas don't work unless you do.</p>
      </div>

      <div className="login-panel">
        <div className="login-tabs">
          <button
            className={`login-tab${mode === "login" ? " login-tab-active" : ""}`}
            onClick={() => setMode("login")}
            type="button"
          >
            Login
          </button>
          <button
            className={`login-tab${mode === "signup" ? " login-tab-active" : ""}`}
            onClick={() => setMode("signup")}
            type="button"
          >
            Sign Up
          </button>
        </div>

        <h2 className="login-welcome">{mode === "login" ? "Welcome back 👋" : "Create your account"}</h2>
        <p className="login-subcopy">
          {mode === "login" ? "Glad to see you again." : "Set up your team's workspace in a minute."}
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <Input
              label="Full name"
              placeholder="Your name"
              value={form.name}
              onChange={handleChange("name")}
              error={errors.name}
            />
          )}
          <Input
            label="Email"
            type="email"
            placeholder="yourname@university.edu"
            value={form.email}
            onChange={handleChange("email")}
            error={errors.email}
          />
          <div>
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange("password")}
              error={errors.password}
            />
            {mode === "login" && (
              <div className="login-forgot">
                <a href="#forgot">Forgot password?</a>
              </div>
            )}
          </div>

          {formError && <p className="login-form-error">{formError}</p>}

          <Button type="submit" fullWidth isLoading={isSubmitting}>
            {mode === "login" ? "Login" : "Create account"}
          </Button>
        </form>

        <div className="login-divider">
          <span />
          <p>or continue with</p>
          <span />
        </div>

        <div className="login-providers">
          <Button variant="secondary" fullWidth onClick={() => handleProvider("google")}>
            Continue with Google
          </Button>
          <Button variant="secondary" fullWidth onClick={() => handleProvider("github")}>
            Continue with GitHub
          </Button>
        </div>

        <p className="login-switch">
          {mode === "login" ? (
            <>Don't have an account? <button type="button" onClick={() => setMode("signup")}>Sign up</button></>
          ) : (
            <>Already have an account? <button type="button" onClick={() => setMode("login")}>Login</button></>
          )}
        </p>
      </div>
    </div>
  );
}
