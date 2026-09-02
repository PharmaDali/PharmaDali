import React, { useState } from "react";
import Modal from "../../shared/components/Modal";
import PasswordField from "../../shared/components/PasswordField";
import { sendAdminChangePasswordOtp, verifyAdminChangePasswordOtp, updateAdminPasswordWithOtp } from "../../services/profileService";
import sendEmailIcon from "../../assets/icons/change-password/send_email_icon.svg";
import verifyOtpIcon from "../../assets/icons/change-password/verify_otp_icon.svg";
import verifiedOtpIcon from "../../assets/icons/change-password/verified_otp_icon.svg";

const AdminChangePasswordOtpModals = ({ show, onHide, email, currentPassword, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSendOtp = async () => {
    setError("");
    setLoading(true);
    try {
      await sendAdminChangePasswordOtp({ email, current_password: currentPassword });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join("");
    if (code.length < 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await verifyAdminChangePasswordOtp({ email, otp: code });
      setResetToken(res.reset_token);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP code.");
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
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleUpdatePassword = async () => {
    setError("");
    if (!newPassword || newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await updateAdminPasswordWithOtp({
          email,
          reset_token: resetToken,
          password: newPassword,
          password_confirmation: confirmPassword
        });
      setStep(5);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (step === 5) {
      onSuccess?.();
    }
    onHide();
    setTimeout(() => {
      setStep(1);
      setOtp(["", "", "", "", "", ""]);
      setResetToken("");
      setNewPassword("");
      setConfirmPassword("");
      setError("");
    }, 300);
  };

  return (
    <>
      <style>{`
        .otp-input:focus {
          border-color: #48AAD9 !important;
          box-shadow: none !important;
        }
      `}</style>
      <Modal isOpen={show && step === 1} onClose={handleClose} size="sm" closeOnOverlay={false} showCloseButton={false}>
        <div className="d-flex justify-content-end pt-3 pe-3">
          <i className="fa-solid fa-xmark text-muted fs-5" style={{ cursor: "pointer" }} onClick={handleClose}></i>
        </div>
        <div className="text-center py-2 px-1">
          <h5 className="fw-bold mb-4" style={{ color: "var(--pd-primary)" }}>Change Password</h5>
          <div className="mb-3 d-flex justify-content-center">
            <img src={sendEmailIcon} alt="Send OTP" height="80" />
          </div>
          <p className="text-muted small mb-3">For your security, we will send a One-Time Password (OTP) to your registered email address.</p>
          <div className="d-flex align-items-center border rounded p-2 mb-4 bg-light text-start">
            <i className="fa-regular fa-envelope mx-2 text-muted"></i>
            <div>
              <div className="fw-semibold small">{email}</div>
              <div className="text-muted" style={{ fontSize: "0.7rem" }}>Registered email address</div>
            </div>
          </div>
          {error && <div className="text-danger small mb-3">{error}</div>}
          <button className="btn btn-primary w-100" onClick={handleSendOtp} disabled={loading} style={{ backgroundColor: "var(--pd-primary)", border: "none" }}>
            {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : "Send OTP"}
          </button>
        </div>
      </Modal>

      <Modal isOpen={show && step === 2} onClose={handleClose} size="sm" closeOnOverlay={false} showCloseButton={false}>
        <div className="d-flex justify-content-end pt-3 pe-3">
          <i className="fa-solid fa-xmark text-muted fs-5" style={{ cursor: "pointer" }} onClick={handleClose}></i>
        </div>
        <div className="text-center py-2 px-1">
          <h5 className="fw-bold mb-4" style={{ color: "#48AAD9" }}>Verify OTP</h5>
          <div className="mb-3 d-flex justify-content-center">
             <img src={verifyOtpIcon} alt="Verify OTP" height="60" />
          </div>
          <p className="text-muted small mb-1">We sent an OTP to</p>
          <p className="fw-bold mb-3 small">{email}</p>
          
          <div className="d-flex justify-content-between mb-3 gap-1">
            {otp.map((digit, i) => (
                              <input
                  key={i}
                  id={`otp-input-${i}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                className="form-control otp-input text-center p-0 fw-semibold fs-5"
                style={{ width: "40px", height: "45px" }}
              />
            ))}
          </div>

          {error && <div className="text-danger small mb-3">{error}</div>}
          
          <p className="text-muted small mb-4">
            Didn't receive the code? <span className="fw-bold" style={{ cursor: "pointer", color: "#48AAD9" }} onClick={handleSendOtp}>Resend OTP</span>
          </p>

          <button className="btn btn-primary w-100" onClick={handleVerifyOtp} disabled={loading} style={{ backgroundColor: "var(--pd-primary)", border: "none" }}>
            {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : "Verify OTP"}
          </button>
        </div>
      </Modal>

      <Modal isOpen={show && step === 3} onClose={handleClose} size="sm" closeOnOverlay={false} showCloseButton={false}>
        <div className="d-flex justify-content-end pt-3 pe-3">
          <i className="fa-solid fa-xmark text-muted fs-5" style={{ cursor: "pointer" }} onClick={handleClose}></i>
        </div>
        <div className="text-center py-2 px-1">
          <h5 className="fw-bold mb-4" style={{ color: "var(--pd-primary)" }}>OTP Verified</h5>
          <div className="mb-3 d-flex justify-content-center mt-3">
             <img src={verifiedOtpIcon} alt="Success" height="60" />
          </div>
          <p className="text-muted small mb-4 mt-4">You can now set your new password.</p>
          <button className="btn btn-primary w-100" onClick={() => setStep(4)} style={{ backgroundColor: "var(--pd-primary)", border: "none" }}>
            Continue
          </button>
        </div>
      </Modal>

      <Modal isOpen={show && step === 4} onClose={handleClose} size="sm" closeOnOverlay={false} showCloseButton={false}>
        <div className="d-flex justify-content-end pt-3 pe-3">
          <i className="fa-solid fa-xmark text-muted fs-5" style={{ cursor: "pointer" }} onClick={handleClose}></i>
        </div>
        <div className="text-start py-2 px-1">
          <h5 className="fw-bold mb-4 text-center" style={{ color: "var(--pd-primary)" }}>New Password</h5>
          <div className="mb-2">
            <label className="small fw-semibold mb-1">New Password *</label>
            <PasswordField 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
              placeholder="••••••••••••" 
            />
            <small className="text-muted" style={{ fontSize: "0.7rem" }}>Minimum of 8 characters</small>
          </div>

          <div className="mb-4">
            <label className="small fw-semibold mb-1">Confirm new Password *</label>
            <PasswordField 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              placeholder="••••••••••••" 
            />
          </div>

          {error && <div className="text-danger small mb-3 text-center">{error}</div>}

          <button className="btn btn-primary w-100" onClick={handleUpdatePassword} disabled={loading} style={{ backgroundColor: "var(--pd-primary)", border: "none" }}>
            {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : "Update Password"}
          </button>
        </div>
      </Modal>

      <Modal isOpen={show && step === 5} onClose={handleClose} size="sm" closeOnOverlay={false} showCloseButton={false}>
        <div className="d-flex justify-content-end pt-3 pe-3">
          <i className="fa-solid fa-xmark text-muted fs-5" style={{ cursor: "pointer" }} onClick={handleClose}></i>
        </div>
        <div className="text-center py-2 px-1">
          <h5 className="fw-bold mb-4" style={{ color: "var(--pd-primary)" }}>Password Updated</h5>
          <div className="mb-3 d-flex justify-content-center mt-3">
             <img src={verifiedOtpIcon} alt="Success" height="60" />
          </div>
          <p className="fw-semibold small mb-1 mt-4">Your password has been successfully updated</p>
          <p className="text-muted mb-4" style={{ fontSize: "0.75rem" }}>You can now use your new password to log in.</p>
          <button className="btn btn-primary w-100" onClick={handleClose} style={{ backgroundColor: "var(--pd-primary)", border: "none" }}>
            Close
          </button>
        </div>
      </Modal>
    </>
  );
};

export default AdminChangePasswordOtpModals;










