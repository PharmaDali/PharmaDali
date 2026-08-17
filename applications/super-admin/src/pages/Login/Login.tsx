import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/loginService";
import logo from '../../assets/log-in-logo.svg';
import { Input } from "../../components/common";

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
      navigate("/homepage", { replace: true });
    } catch (err: any) {
      setError(err?.message || "Invalid email or password.");
      localStorage.removeItem("isAuthenticated");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-dark)] text-[var(--color-text-white)] font-[var(--font-primary)]">
      <div className="flex flex-col md:flex-row items-center justify-center gap-[40px] md:gap-[300px] w-full max-w-[1200px] p-10">
        
        <div className="flex flex-col items-center animate-fade-in-left">
          <img src={logo} alt="PharmaDali Logo" className="max-w-[350px] w-full h-auto" />
        </div>

        <div className="shrink-0 w-full md:w-[400px] opacity-0 animate-fade-in-right [animation-delay:0.2s]">
          <form onSubmit={handleLogin} className="bg-transparent border border-[var(--color-input-border)] rounded-xl p-10 flex flex-col gap-5">
            <h2 className="text-[var(--color-primary-blue)] text-2xl font-semibold m-0 mb-2.5 text-center">Log In</h2>

            <Input
              type="text"
              name="email"
              placeholder="Admin ID"
              value={credentials.email}
              onChange={handleChange}
              className="bg-[var(--color-input-bg)] hover:bg-[var(--color-input-bg-focus)] focus:bg-[var(--color-input-bg-focus)] border-none rounded-lg px-4 py-3.5 text-[var(--color-text-white)] text-sm font-medium outline-none transition-colors placeholder:text-[var(--color-placeholder)] font-[var(--font-primary)]"
              required
            />

            <Input
              type="password"
              name="password"
              placeholder="Password"
              value={credentials.password}
              onChange={handleChange}
              className="bg-[var(--color-input-bg)] hover:bg-[var(--color-input-bg-focus)] focus:bg-[var(--color-input-bg-focus)] border-none rounded-lg px-4 py-3.5 text-[var(--color-text-white)] text-sm font-medium outline-none transition-colors placeholder:text-[var(--color-placeholder)] font-[var(--font-primary)]"
              required
            />

            {error && <p className="text-[var(--color-danger-red)] text-sm m-0 text-center font-medium">{error}</p>}

            <div className="flex justify-between items-center mt-2.5">
              <button type="button" className="bg-transparent border-none text-[var(--color-text-white)] text-xs font-medium cursor-pointer p-0 underline opacity-80 hover:opacity-100 transition-opacity font-[var(--font-primary)]">
                Forgot Password?
              </button>
              <button type="submit" disabled={isSubmitting} className="bg-[var(--color-primary-blue)] text-[var(--color-bg-dark)] border-none rounded-lg px-6 py-2.5 text-sm font-semibold cursor-pointer transition-all hover:opacity-90 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed font-[var(--font-primary)]">
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
