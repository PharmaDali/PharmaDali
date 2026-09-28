import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import verifyOtpIcon from "../../assets/icons/change-password/verify_otp_icon.svg";

const VerifyOtpModal = ({
  show,
  onHide,
  email,
  onVerify,
  onResend,
  title = "Two-Factor Authentication",
  description = "Enter the 6-digit verification code sent to"
}) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [cooldown, setCooldown] = useState(60);

  // Initialize and reset state when modal opens
  useEffect(() => {
    if (show) {
      setOtp(["", "", "", "", "", ""]);
      setError("");
      setInfoMessage("");
      setCooldown(60);
      setTimeout(() => {
        const firstInput = document.getElementById("shared-otp-input-0");
        if (firstInput) firstInput.focus();
      }, 150);
    }
  }, [show]);

  // Cooldown countdown timer
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
      setError("Please enter the complete 6-digit code.");
      return;
    }
    setError("");
    setInfoMessage("");
    setLoading(true);

    try {
      if (onVerify) {
        await onVerify(code);
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Invalid or expired verification code.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0 || resending || loading) return;
    setError("");
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
      setError(msg);
    } finally {
      setResending(false);
    }
  };

  const handleOtpChange = (index, value) => {
    // Only allow single numeric character
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance to next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`shared-otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }

    // Auto-submit if 6th digit entered
    if (value && index === 5) {
      const fullCode = newOtp.join("");
      if (fullCode.length === 6) {
        handleVerifyOtp(fullCode);
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pasteData)) {
      const digits = pasteData.split("");
      setOtp(digits);
      const lastInput = document.getElementById("shared-otp-input-5");
      if (lastInput) lastInput.focus();
      handleVerifyOtp(pasteData);
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

  const handleClose = () => {
    if (!loading) {
      onHide();
    }
  };

  return (
    <>
      <style>{`
        .shared-otp-input:focus {
          border-color: #2aabe2 !important;
          box-shadow: 0 0 0 0.2rem rgba(42, 171, 226, 0.25) !important;
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
        <div className="text-center py-2 px-1">
          <h5 className="fw-bold mb-3" style={{ color: "#2aabe2" }}>{title}</h5>
          <div className="mb-3 d-flex justify-content-center">
            <img src={verifyOtpIcon} alt="Verify OTP" height="60" />
          </div>
          <p className="text-muted small mb-1">{description}</p>
          <p className="fw-bold mb-3 small text-dark">{email}</p>

          <div className="d-flex justify-content-between mb-3 gap-1" onPaste={handlePaste}>
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
                className="form-control shared-otp-input text-center p-0 fw-semibold fs-5"
                style={{ width: "42px", height: "48px", borderRadius: "8px" }}
              />
            ))}
          </div>

          {error && <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3 text-start">{error}</div>}
          {infoMessage && <div className="alert alert-success py-2 px-3 small rounded-3 mb-3 text-start">{infoMessage}</div>}

          <p className="text-muted small mb-4">
            Didn't receive the code?{" "}
            {cooldown > 0 ? (
              <span className="text-muted fw-semibold">Resend code in {cooldown}s</span>
            ) : (
              <span
                className="fw-bold"
                style={{ cursor: resending ? "not-allowed" : "pointer", color: "#2aabe2" }}
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
      </Modal>
    </>
  );
};

export default VerifyOtpModal;
