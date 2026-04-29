import { useState } from "react";
import { SettingForm } from "./SettingForm";

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
          className="form-control settings-form-input"
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
        <div className="d-flex flex-column gap-2">
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
        </div>
      ),
    },
    {
      key: "rememberPassword",
      label: "Remember Password",
      helper: "Keep this device signed in to speed up logins.",
      content: (
        <div className="d-flex justify-content-end">
          <input
            type="checkbox"
            className="form-check-input"
            checked={formData.rememberPassword}
            onChange={(e) => handleInputChange("rememberPassword", e.target.checked)}
            disabled={!isEditing}
          />
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
