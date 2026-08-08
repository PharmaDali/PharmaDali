import { useState } from "react";
import { SettingForm } from "./SettingForm";
import "../../assets/css/settings/common.css";

const initialAccountData = {
  recoveryEmail: "admin.recovery@pharmadali.com",
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
  emailAlerts: true,
  securityNotifications: true,
};

export const AccountSettings = ({ onNavigate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [savedData, setSavedData] = useState(initialAccountData);
  const [formData, setFormData] = useState(initialAccountData);
  const [passwordError, setPasswordError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "confirmPassword" || field === "newPassword") {
      setPasswordError("");
    }
  };

  const handleSave = () => {
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setPasswordError("New password and confirmation password do not match.");
      return;
    }
    setPasswordError("");
    const updated = {
      ...formData,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };
    setSavedData(updated);
    setFormData(updated);
    setIsEditing(false);
    setSuccessMessage("Account security settings updated successfully.");
    setTimeout(() => setSuccessMessage(""), 4000);
    // Prepared for backend API Sanctum POST /api/user/password endpoint
  };

  const handleCancel = () => {
    setFormData(savedData);
    setPasswordError("");
    setIsEditing(false);
  };

  const sections = [
    {
      key: "recoveryEmail",
      label: "Security Recovery Email",
      helper: "Email address used to receive security alerts and password reset links.",
      content: (
        <input
          type="email"
          className="form-control settings-form-input"
          placeholder="recovery@pharmadali.com"
          value={formData.recoveryEmail}
          onChange={(e) => handleInputChange("recoveryEmail", e.target.value)}
          disabled={!isEditing}
        />
      ),
    },
    {
      key: "password",
      label: "Change Password",
      helper: "Update account login password securely.",
      content: (
        <div className="d-flex flex-column gap-2 w-100">
          <input
            type="password"
            className="form-control settings-form-input"
            placeholder="Current Password"
            value={formData.currentPassword}
            onChange={(e) => handleInputChange("currentPassword", e.target.value)}
            disabled={!isEditing}
          />
          <input
            type="password"
            className="form-control settings-form-input"
            placeholder="New Password"
            value={formData.newPassword}
            onChange={(e) => handleInputChange("newPassword", e.target.value)}
            disabled={!isEditing}
          />
          <input
            type="password"
            className="form-control settings-form-input"
            placeholder="Confirm New Password"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
            disabled={!isEditing}
          />
          {passwordError && (
            <div className="text-danger small mt-1">{passwordError}</div>
          )}
        </div>
      ),
    },
    {
      key: "securityNotifications",
      label: "Security & System Alerts",
      helper: "Receive real-time notifications for login attempts and system security updates.",
      content: (
        <div className="d-flex flex-column gap-2">
          <div
            className="pd-checkbox-container"
            onClick={() => isEditing && handleInputChange("emailAlerts", !formData.emailAlerts)}
          >
            <input
              type="checkbox"
              className="pd-checkbox"
              checked={formData.emailAlerts}
              disabled={!isEditing}
              onChange={() => {}}
            />
            <span className="pd-checkbox-label">Email security alerts</span>
          </div>
          <div
            className="pd-checkbox-container"
            onClick={() => isEditing && handleInputChange("securityNotifications", !formData.securityNotifications)}
          >
            <input
              type="checkbox"
              className="pd-checkbox"
              checked={formData.securityNotifications}
              disabled={!isEditing}
              onChange={() => {}}
            />
            <span className="pd-checkbox-label">In-app security notifications</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <SettingForm
      title="Account & Security"
      description="Manage account security credentials, password changes, and security notifications."
      isEditing={isEditing}
      onEditChange={setIsEditing}
      onSave={handleSave}
      onCancel={handleCancel}
      showEditSave={true}
      breadcrumbs={[
        { label: "Settings", view: "settings" },
        { label: "Account & Security", view: "account" },
      ]}
      onNavigate={onNavigate}
    >
      {successMessage && (
        <div className="alert alert-success py-2 px-3 mb-3 text-center small rounded-3 border-0 bg-success-subtle text-success">
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
  );
};

export default AccountSettings;
