import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/loginService";

function Login() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(credentials);
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("tokenExpiry", String(Date.now() + 8 * 60 * 60 * 1000));
      navigate("/", { replace: true });
    } catch (err) {
      setError(err?.message || "Invalid email or password.");
      localStorage.removeItem("isAuthenticated");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-brand-block" aria-hidden="true">
        <div className="login-logo-stack">
          <img src="/PhamaDali Logo v2.svg" alt="PharmaDali" className="login-logo login-logo-white" />
          <img src="/descriptive_logo.svg" alt="PharmaDali" className="login-logo login-logo-blue" />
        </div>
      </div>

      <form onSubmit={handleLogin} className="login-form-panel">
        <h2 className="login-form-title">Log In</h2>

        <input
          type="email"
          name="email"
          placeholder="Admin Email"
          value={credentials.email}
          onChange={handleChange}
          className="login-input"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={credentials.password}
          onChange={handleChange}
          className="login-input"
          required
        />

        {error && <p className="login-error">{error}</p>}

        <div className="login-form-footer">
          <button type="button" className="login-forgot-btn">
            Forgot Password?
          </button>
          <button type="submit" className="login-submit-btn">
            {isSubmitting ? "Logging in..." : "Mag-login"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Login;