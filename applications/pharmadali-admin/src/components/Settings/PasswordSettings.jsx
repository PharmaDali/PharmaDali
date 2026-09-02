import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { SettingForm } from "./SettingForm";
import "../../assets/css/settings/common.css";
import { updateAdminPassword } from "../../services/pharmacySettingsService";
import PasswordField from "../../shared/components/PasswordField";
import AdminChangePasswordOtpModals from "./AdminChangePasswordOtpModals";

export const PasswordSettings = ({ onNavigate }) => {
  const { user, setUser } = useOutletContext() || {};
  const isNewlyCreatedAdmin = user?.requires_password_change;

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showOtpModals, setShowOtpModals] = useState(false);
  const [tempPassword, setTempPassword] = useState("");

  const handleSave = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!currentPassword) {
      setErrorMessage("Please enter your current password.");
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setErrorMessage("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("New password and confirmation password do not match. Please try again.");
      return;
    }

    try {
      setSaving(true);
      const res = await updateAdminPassword(currentPassword, newPassword, confirmPassword);

      if (res.status === "success") {
        setSuccessMessage(res.message || "Your password has been updated successfully.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setIsEditing(false);
        setTimeout(() => setSuccessMessage(""), 5000);
      }
    } catch (err) {
      const apiMsg = err.response?.data?.message || err.message || "Failed to update password.";
      setErrorMessage(apiMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setErrorMessage("");
    setIsEditing(false);
  };

  const handleOtpSuccess = () => {
    setSuccessMessage("Your password has been updated successfully.");
    if (setUser) {
      setUser(prev => ({ ...prev, requires_password_change: false }));
    } else if (user) {
      user.requires_password_change = false; // fallback mutation
    }
  };

  const standardContent = (
    <div className="d-flex flex-column gap-1 w-100">
      <PasswordField
        name="currentPassword"
        placeholder="Current Password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        disabled={!isEditing || saving}
        inputClassName="form-control settings-form-input"
        containerClassName="mb-1"
        autoComplete="current-password"
      />
      <PasswordField
        name="newPassword"
        placeholder="New Password (min. 8 characters)"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        disabled={!isEditing || saving}
        inputClassName="form-control settings-form-input"
        containerClassName="mb-1"
        autoComplete="new-password"
      />
      <PasswordField
        name="confirmPassword"
        placeholder="Confirm New Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        disabled={!isEditing || saving}
        inputClassName="form-control settings-form-input"
        containerClassName="mb-0"
        autoComplete="new-password"
      />
    </div>
  );

  const newAdminContent = (
    <div className="d-flex flex-column gap-3 w-100">
      <div className="d-flex align-items-center gap-3">
        <div className="flex-grow-1">
          <input type="password" value={tempPassword} onChange={(e) => setTempPassword(e.target.value)} placeholder="Enter your temporary password" className="form-control settings-form-input" />
        </div>
      </div>
      <div>
        <button 
          className="btn btn-primary px-4 py-2" 
          style={{ backgroundColor: "var(--pd-primary)", border: "none", fontSize: "0.9rem", minWidth: "180px" }}
          onClick={() => {
            if (!tempPassword) {
              setErrorMessage("Please enter your temporary password.");
              return;
            }
            setErrorMessage("");
            setShowOtpModals(true);
          }}
        >
          Change Password
        </button>
      </div>
    </div>
  );

  const sections = [
    {
      key: "password",
      label: "Change Password",
      helper: "Update admin account login password securely.",
      content: isNewlyCreatedAdmin ? newAdminContent : standardContent,
    },
  ];

  return (
    <>
      <SettingForm
        title="Password Settings"
        description="Manage admin account security credentials and change password."
        isEditing={isEditing}
        onEditChange={setIsEditing}
        onSave={handleSave}
        onCancel={handleCancel}
        showEditSave={!isNewlyCreatedAdmin}
        breadcrumbs={[
          { label: "Settings", view: "settings" },
          { label: "Password Settings", view: "account" },
        ]}
        onNavigate={onNavigate}
      >
        {isNewlyCreatedAdmin && (
          <div className="alert alert-info py-2 px-3 mb-3 small rounded-3 border-0 d-flex align-items-start gap-2 w-100" style={{ backgroundColor: "#eef7fd", color: "#4f5a6b" }}>
            <i className="fa-solid fa-circle-info text-info mt-1 flex-shrink-0"></i>
            <span className="flex-grow-1">You're using a temporary password. Please create a new password to secure your account.</span>
          </div>
        )}
        {errorMessage && (
          <div className="alert alert-danger py-2 px-3 mb-3 small rounded-3 border-0 bg-danger-subtle text-danger">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="alert alert-success py-2 px-3 mb-3 small rounded-3 border-0 bg-success-subtle text-success">
            {successMessage}
          </div>
        )}
        <div className="settings-section-list">
          {sections.map((section, index) => (
            <div
              key={section.key}
              className={`settings-section-row${index === sections.length - 1 ? " is-last" : ""}`}
            >
              <div className="settings-section-left">
                <p className="settings-section-title">{section.label}</p>
                <p className="settings-section-helper">{section.helper}</p>
              </div>
              <div className="settings-section-right">{section.content}</div>
            </div>
          ))}
        </div>
      </SettingForm>

      <AdminChangePasswordOtpModals
        show={showOtpModals}
        onHide={() => setShowOtpModals(false)}
        email={user?.email}
        currentPassword={tempPassword}
        onSuccess={handleOtpSuccess}
      />
    </>
  );
};

export default PasswordSettings;


