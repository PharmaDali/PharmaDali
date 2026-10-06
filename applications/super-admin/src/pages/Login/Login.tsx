import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/authService";
import logo from '../../assets/log-in-logo.svg';
import { Input, Modal } from "../../components/common";

function Login() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showDeactivatedModal, setShowDeactivatedModal] = useState(false);
  const [deactivatedMessage, setDeactivatedMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const notice = sessionStorage.getItem("superadmin_account_deactivated_notice");
    if (params.get("deactivated") === "1" || notice) {
      setDeactivatedMessage(notice || "Your account has been deactivated. Please contact support.");
      setShowDeactivatedModal(true);
      sessionStorage.removeItem("superadmin_account_deactivated_notice");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const data = await login(credentials);
      if (!data?.token) {
        setError(data?.message || "Login failed: No authentication token received.");
        return;
      }
      if (data?.role !== "super_admin") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("isAuthenticated");
        setError("Access denied. Super Admin role is required for this portal.");
        return;
      }
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("tokenExpiry", String(Date.now() + 8 * 60 * 60 * 1000));
      navigate("/homepage", { replace: true });
    } catch (err: any) {
      const rawMsg = err?.response?.data?.message || err?.message || "";
      if (typeof rawMsg === "string" && rawMsg.toLowerCase().includes("deactivated")) {
        setDeactivatedMessage(rawMsg);
        setShowDeactivatedModal(true);
      } else {
        setError(rawMsg || "Invalid email or password.");
      }
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
              type="email"
              name="email"
              placeholder="Email"
              value={credentials.email}
              onChange={handleChange}
              className="bg-[var(--color-input-bg)] hover:bg-[var(--color-input-bg-focus)] focus:bg-[var(--color-input-bg-focus)] border-none rounded-lg px-4 py-3.5 text-[var(--color-text-white)] text-sm font-medium outline-none transition-colors placeholder:text-[var(--color-placeholder)] font-[var(--font-primary)]"
              required
            />

            <Input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={credentials.password}
              onChange={handleChange}
              className="bg-[var(--color-input-bg)] hover:bg-[var(--color-input-bg-focus)] focus:bg-[var(--color-input-bg-focus)] border-none rounded-lg px-4 py-3.5 text-[var(--color-text-white)] text-sm font-medium outline-none transition-colors placeholder:text-[var(--color-placeholder)] font-[var(--font-primary)]"
              required
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[var(--color-placeholder)] hover:text-[var(--color-text-white)] transition-colors focus:outline-none"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              }
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

      <Modal
        isOpen={showDeactivatedModal}
        onClose={() => setShowDeactivatedModal(false)}
        maxWidth="max-w-[400px]"
      >
        <div className="flex flex-col items-center text-center p-2">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4 text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>

          <div className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider mb-2">
            Access Revoked
          </div>

          <h3 className="text-xl font-bold text-white mb-2">
            Account Deactivated
          </h3>

          <p className="text-sm text-gray-300 leading-relaxed mb-6">
            {deactivatedMessage || "Your Super Admin account has been deactivated. Please contact the platform administration."}
          </p>

          <button
            type="button"
            onClick={() => setShowDeactivatedModal(false)}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors shadow-lg active:scale-95 cursor-pointer"
          >
            Understood
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default Login;
