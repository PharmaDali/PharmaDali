import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/loginService";
import './login.css';
import logo from '../../assets/log-in-logo.svg';

function Login() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(credentials);
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("tokenExpiry", String(Date.now() + 8 * 60 * 60 * 1000));
      navigate("/", { replace: true });
    } catch (err: any) {
      setError(err?.message || "Invalid email or password.");
      localStorage.removeItem("isAuthenticated");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-brand-block fade-in-left">
          <img src={logo} alt="PharmaDali Logo" className="login-logo" />
        </div>

        <div className="login-form-wrapper fade-in-right">
          <form onSubmit={handleLogin} className="login-form-panel">
            <h2 className="login-form-title">Log In</h2>

            <input
              type="text"
              name="email"
              placeholder="Admin ID"
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
              <button type="submit" className="login-submit-btn" disabled={isSubmitting}>
                {isSubmitting ? "Logging in..." : "Mag-login"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
