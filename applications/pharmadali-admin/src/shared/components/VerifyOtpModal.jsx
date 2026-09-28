import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import verifyOtpIcon from "../../assets/icons/change-password/verify_otp_icon.svg";

const VerifyOtpModal = ({ show, onHide, email, onVerify, title = "Two-Factor Authentication", description = "Enter the 6-digit code sent to" }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (show) {
      setOtp(["", "", "", "", "", ""]);
      setError("");
    }
  }, [show]);

  const handleVerifyOtp = async () => {
    const code = otp.join("");
    if (code.length < 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      if (onVerify) {
        await onVerify(code);
      }
    } catch (err) {
      setError(err?.message || "Invalid OTP code.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`shared-otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
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
    onHide();
  };

  return (
    <>
      <style>{`
        .shared-otp-input:focus {
          border-color: #48AAD9 !important;
          box-shadow: none !important;
        }
      `}</style>
      <Modal isOpen={show} onClose={handleClose} size="sm" closeOnOverlay={false} showCloseButton={false}>
        <div className="d-flex justify-content-end pt-3 pe-3">
          <i className="fa-solid fa-xmark text-muted fs-5" style={{ cursor: "pointer" }} onClick={handleClose}></i>
        </div>
        <div className="text-center py-2 px-1">
          <h5 className="fw-bold mb-4" style={{ color: "#48AAD9" }}>{title}</h5>
          <div className="mb-3 d-flex justify-content-center">
             <img src={verifyOtpIcon} alt="Verify OTP" height="60" />
          </div>
          <p className="text-muted small mb-1">{description}</p>
          <p className="fw-bold mb-3 small">{email}</p>
          
          <div className="d-flex justify-content-between mb-3 gap-1">
            {otp.map((digit, i) => (
              <input
                key={i}
                id={`shared-otp-input-${i}`}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength="1"
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onClick={() => handleClick(i)}
                className="form-control shared-otp-input text-center p-0 fw-semibold fs-5"
                style={{ width: "40px", height: "45px" }}
              />
            ))}
          </div>

          {error && <div className="text-danger small mb-3">{error}</div>}
          
          <p className="text-muted small mb-4">
            Didn't receive the code? <span className="fw-bold" style={{ cursor: "pointer", color: "#48AAD9" }}>Resend OTP</span>
          </p>

          <button className="btn btn-primary w-100" onClick={handleVerifyOtp} disabled={loading} style={{ backgroundColor: "var(--pd-primary)", border: "none" }}>
            {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : "Verify"}
          </button>
        </div>
      </Modal>
    </>
  );
};

export default VerifyOtpModal;
