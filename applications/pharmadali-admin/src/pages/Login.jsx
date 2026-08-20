import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/loginService";
import PasswordField from "../components/PasswordField";

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
      const data = await login(credentials);
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("tokenExpiry", String(Date.now() + 8 * 60 * 60 * 1000));

      const role = data?.role || data?.user?.role;
      if (role === "pharmacist") {
        navigate("/pos", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err) {
      setError(err?.message || "Invalid email or password.");
      localStorage.removeItem("isAuthenticated");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    // Forgot password info or handler
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

        <div className="w-100 mb-3">
          <input
            type="email"
            name="email"
            placeholder="Admin Email"
            value={credentials.email}
            onChange={handleChange}
            className="form-control pd-password-input login-input mb-0"
            required
            autoComplete="email"
          />
        </div>

        <PasswordField
          name="password"
          placeholder="Password"
          value={credentials.password}
          onChange={handleChange}
          inputClassName="login-input mb-0"
          containerClassName="mb-3"
          required
          autoComplete="current-password"
        />

        {error && <p className="login-error">{error}</p>}

        <div className="login-form-footer">
          <button type="button" className="login-forgot-btn" onClick={handleForgotPassword}>
            Forgot Password?
          </button>
          <button type="submit" className="login-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Mag-login"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Login;