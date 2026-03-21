import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    if (credentials.username === "admin" && credentials.password === "jamestheadmin") {
      localStorage.setItem("isAuthenticated", "true");
      navigate("/", { replace: true });
    } else {
      setError("Invalid username or password.");
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
          type="text"
          name="username"
          placeholder="Admin ID"
          value={credentials.username}
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
            Mag-login
          </button>
        </div>
      </form>
    </div>
  );
}

export default Login;