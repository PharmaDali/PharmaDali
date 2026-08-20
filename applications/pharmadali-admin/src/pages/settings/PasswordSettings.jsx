import { useState } from "react";
import { SettingForm } from "./SettingForm";
import "../../assets/css/settings/common.css";
import { updateAdminPassword } from "../../services/pharmacySettingsService";
import PasswordField from "../../components/PasswordField";

export const PasswordSettings = ({ onNavigate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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

  const sections = [
    {
      key: "password",
      label: "Change Password",
      helper: "Update admin account login password securely.",
      content: (
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
      ),
    },
  ];

  return (
    <SettingForm
      title="Password Settings"
      description="Manage admin account security credentials and change password."
      isEditing={isEditing}
      onEditChange={setIsEditing}
      onSave={handleSave}
      onCancel={handleCancel}
      showEditSave={true}
      breadcrumbs={[
        { label: "Settings", view: "settings" },
        { label: "Password Settings", view: "account" },
      ]}
      onNavigate={onNavigate}
    >
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
  );
};

export default PasswordSettings;
