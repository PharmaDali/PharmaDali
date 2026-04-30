import { useState } from "react";
import { SettingForm } from "./SettingForm";
import "../../assets/css/settings/common.css";

const initialData = {
  recoveryEmail: "",
  currentPassword: "",
  newPassword: "",
  rememberPassword: false,
};

export const AccountSettings = ({ onNavigate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(initialData);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  const sections = [
    {
      key: "recoveryEmail",
      label: "Recovery Email",
      helper: "Receive recovery instructions and security updates.",
      content: (
        <input
          type="email"
          className="settings-form-input"
          placeholder="Add recovery email"
          value={formData.recoveryEmail}
          onChange={(e) => handleInputChange("recoveryEmail", e.target.value)}
          disabled={!isEditing}
        />
      ),
    },
    {
      key: "password",
      label: "Reset Password",
      helper: "Update your account password and security credentials.",
      content: (
        <div className="settings-flex-column">
          <input
            type="password"
            className="settings-form-input"
            placeholder="Current Password"
            value={formData.currentPassword}
            onChange={(e) => handleInputChange("currentPassword", e.target.value)}
            disabled={!isEditing}
          />
          <input
            type="password"
            className="settings-form-input"
            placeholder="New Password"
            value={formData.newPassword}
            onChange={(e) => handleInputChange("newPassword", e.target.value)}
            disabled={!isEditing}
          />
        </div>
      ),
    },
    {
      key: "rememberPassword",
      label: "Remember Password",
      helper: "Keep this device signed in to speed up logins.",
      content: (
        <div className="settings-section-right">
          <div className="pd-checkbox-container" onClick={() => isEditing && handleInputChange("rememberPassword", !formData.rememberPassword)}>
            <input
              type="checkbox"
              className="pd-checkbox"
              checked={formData.rememberPassword}
              disabled={!isEditing}
              onChange={() => {}}
            />
            <span className="pd-checkbox-label">Keep me signed in</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <SettingForm
      title="Account Settings"
      description="Manage account credentials and security options."
      isEditing={isEditing}
      onEditChange={setIsEditing}
      onSave={handleSave}
      breadcrumbs={[
        { label: "Settings", view: "settings" },
        { label: "Account Settings", view: "account" },
      ]}
      onNavigate={onNavigate}
    >
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
