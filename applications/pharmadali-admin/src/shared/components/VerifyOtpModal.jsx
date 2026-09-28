import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import verifyOtpIcon from "../../assets/icons/change-password/verify_otp_icon.svg";
import successfulIcon from "../../assets/icons/modal-icons/successful-task.svg";
import errorIcon from "../../assets/icons/modal-icons/error.svg";

const VerifyOtpModal = ({
  show,
  onHide,
  email,
  onVerify,
  onProceed,
  onResend,
  title = "Two-Factor Authentication",
  description = "Enter the 6-digit verification code sent to"
}) => {
  const [step, setStep] = useState("input"); // 'input' | 'success' | 'error'
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isFatalError, setIsFatalError] = useState(false);
  const [fatalErrorMessage, setFatalErrorMessage] = useState("");
  const [authData, setAuthData] = useState(null);
  const [cooldown, setCooldown] = useState(60);

  // Initialize and reset state when modal opens
  useEffect(() => {
    if (show) {
      setStep("input");
      setOtp(["", "", "", "", "", ""]);
      setErrorMessage("");
      setFatalErrorMessage("");
      setInfoMessage("");
      setIsFatalError(false);
      setAuthData(null);
      setCooldown(60);
      setTimeout(() => {
        const firstInput = document.getElementById("shared-otp-input-0");
        if (firstInput) firstInput.focus();
      }, 150);
    }
  }, [show]);

  // Cooldown countdown timer for resend code
  useEffect(() => {
    if (!show || cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [show, cooldown]);

  const handleVerifyOtp = async (codeToVerify) => {
    const code = codeToVerify || otp.join("");
    if (code.length < 6) {
      setErrorMessage("Please enter the complete 6-digit code.");
      return;
    }

    setErrorMessage("");
    setInfoMessage("");
    setLoading(true);

    try {
      if (onVerify) {
        const result = await onVerify(code);
        setAuthData(result);
        setStep("success"); // Show Success Modal before proceeding to dashboard
      }
    } catch (err) {
      const status = err?.response?.status;
      const rawMsg = err?.response?.data?.message || err?.message || "";
      const isFatal = status === 429 || (typeof rawMsg === "string" && rawMsg.toLowerCase().includes("session"));

      if (isFatal) {
        // Fatal lockout or expired session: show full error modal with "Back to Login"
        setFatalErrorMessage(rawMsg || "Too many failed attempts. Please log in again.");
        setIsFatalError(true);
        setStep("error");
      } else {
        // Wrong OTP: Keep on input screen, turn input fields red, display "Wrong OTP, please try again"
        const match = typeof rawMsg === "string" ? rawMsg.match(/\(\d+ attempts remaining\)/i) : null;
        const attemptsText = match ? ` ${match[0]}` : "";
        setErrorMessage(`Wrong OTP, please try again${attemptsText}.`);

        // Reset OTP inputs and autofocus the first box for immediate retry
        setOtp(["", "", "", "", "", ""]);
        setTimeout(() => {
          const firstInput = document.getElementById("shared-otp-input-0");
          if (firstInput) firstInput.focus();
        }, 100);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0 || resending || loading) return;
    setErrorMessage("");
    setInfoMessage("");
    setResending(true);

    try {
      if (onResend) {
        const res = await onResend();
        const msg = res?.data?.message || res?.message || "A new verification code has been sent.";
        setInfoMessage(msg);
      }
      setCooldown(60);
      setOtp(["", "", "", "", "", ""]);
      const firstInput = document.getElementById("shared-otp-input-0");
      if (firstInput) firstInput.focus();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Failed to resend code. Please try again.";
      setErrorMessage(msg);
    } finally {
      setResending(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    // Clear error message and red border on typing
    if (errorMessage) {
      setErrorMessage("");
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance to next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`shared-otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    if (errorMessage) {
      setErrorMessage("");
    }
    const pasteData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pasteData)) {
      const digits = pasteData.split("");
      setOtp(digits);
      const lastInput = document.getElementById("shared-otp-input-5");
      if (lastInput) lastInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`shared-otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleClick = (index) => {
    const firstEmptyIndex = otp.findIndex((val) => val === "");
    if (firstEmptyIndex !== -1 && index > firstEmptyIndex) {
      const emptyInput = document.getElementById(`shared-otp-input-${firstEmptyIndex}`);
      if (emptyInput) emptyInput.focus();
    }
  };

  const handleProceedClick = () => {
    if (onProceed) {
      onProceed(authData);
    }
  };

  const handleClose = () => {
    if (!loading) {
      if (step === "success") {
        handleProceedClick();
      } else {
        onHide();
      }
    }
  };

  const userRole = authData?.role || authData?.user?.role;
  const proceedButtonText = userRole === "pharmacist" ? "Proceed to POS" : "Proceed to Dashboard";

  return (
    <>
      <style>{`
        .shared-otp-input:focus {
          border-color: #2aabe2 !important;
          box-shadow: 0 0 0 0.2rem rgba(42, 171, 226, 0.25) !important;
        }
        .shared-otp-input.has-error,
        .shared-otp-input.is-invalid {
          border-color: #dc3545 !important;
          background-color: #fff8f8 !important;
          color: #dc3545 !important;
          background-image: none !important;
          padding-right: 0 !important;
        }
        .shared-otp-input.has-error:focus,
        .shared-otp-input.is-invalid:focus {
          border-color: #dc3545 !important;
          box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25) !important;
          background-image: none !important;
        }
      `}</style>
      <Modal isOpen={show} onClose={handleClose} size="sm" closeOnOverlay={false} showCloseButton={false}>
        <div className="d-flex justify-content-end pt-3 pe-3">
          <i
            className="fa-solid fa-xmark text-muted fs-5"
            style={{ cursor: loading ? "not-allowed" : "pointer" }}
            onClick={handleClose}
          ></i>
        </div>

        {/* STEP 1: OTP INPUT VIEW */}
        {step === "input" && (
          <div className="text-center py-2 px-1">
            <h5 className="fw-bold mb-3" style={{ color: "var(--pd-primary)" }}>{title}</h5>
            <div className="mb-3 d-flex justify-content-center">
              <img src={verifyOtpIcon} alt="Verify OTP" height="60" />
            </div>
            <p className="text-muted small mb-1">{description}</p>
            <p className="fw-bold mb-3 small text-dark">{email}</p>

            <div className="d-flex justify-content-between mb-2 gap-1" onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`shared-otp-input-${i}`}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength="1"
                  value={digit}
                  disabled={loading}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onClick={() => handleClick(i)}
                  className={`form-control shared-otp-input text-center p-0 fw-semibold fs-5 ${errorMessage ? "has-error" : ""}`}
                  style={{ width: "42px", height: "48px", borderRadius: "8px" }}
                />
              ))}
            </div>

            {/* Error message under red input fields */}
            {errorMessage && (
              <div className="text-danger small fw-semibold mb-3 text-center">
                {errorMessage}
              </div>
            )}

            {infoMessage && (
              <div className="alert alert-success py-2 px-3 small rounded-3 mb-3 text-start">
                <i className="fa-solid fa-circle-check me-2"></i>
                {infoMessage}
              </div>
            )}

            <p className="text-muted small mb-4">
              Didn't receive the code?{" "}
              {cooldown > 0 ? (
                <span className="text-muted fw-semibold">Resend code in {cooldown}s</span>
              ) : (
                <span
                  className="fw-bold"
                  style={{ cursor: resending ? "not-allowed" : "pointer", color: "var(--pd-primary)" }}
                  onClick={handleResendOtp}
                >
                  {resending ? <><i className="fa-solid fa-spinner fa-spin me-1"></i>Sending...</> : "Resend code"}
                </span>
              )}
            </p>

            <button
              className="btn btn-primary w-100 py-2 fw-semibold"
              onClick={() => handleVerifyOtp()}
              disabled={loading || otp.join("").length < 6}
              style={{ backgroundColor: "var(--pd-primary)", border: "none", borderRadius: "8px" }}
            >
              {loading ? <><i className="fa-solid fa-spinner fa-spin me-2"></i>Verifying...</> : "Verify & Log In"}
            </button>
          </div>
        )}

        {/* STEP 2: VERIFICATION SUCCESS MODAL */}
        {step === "success" && (
          <div className="text-center py-3 px-2">
            <div className="mb-3 d-flex justify-content-center mt-2">
              <img src={successfulIcon} alt="Success" style={{ width: "64px", height: "64px" }} />
            </div>
            <h4 className="fw-bold mb-2" style={{ color: "var(--pd-soft-black-dark, #222)" }}>
              Verification Successful
            </h4>
            <p className="text-muted small mb-4">
              Two-factor authentication verified successfully. Welcome back to PharmaDali!
            </p>
            <button
              className="btn btn-primary w-100 py-2 fw-semibold"
              onClick={handleProceedClick}
              style={{ backgroundColor: "var(--pd-primary)", border: "none", borderRadius: "8px" }}
              autoFocus
            >
              {proceedButtonText}
            </button>
          </div>
        )}

        {/* STEP 3: FATAL LOCKOUT ERROR MODAL */}
        {step === "error" && (
          <div className="text-center py-3 px-2">
            <div className="mb-3 d-flex justify-content-center mt-2">
              <img src={errorIcon} alt="Error" style={{ width: "64px", height: "64px" }} />
            </div>
            <h4 className="fw-bold mb-2 text-danger">
              Verification Failed
            </h4>
            <p className="text-muted small mb-4">
              {fatalErrorMessage || "Too many failed attempts or session expired."}
            </p>
            <button
              className="btn btn-secondary w-100 py-2 fw-semibold"
              onClick={handleClose}
              style={{ borderRadius: "8px" }}
              autoFocus
            >
              Back to Login
            </button>
          </div>
        )}
      </Modal>
    </>
  );
};

export default VerifyOtpModal;
