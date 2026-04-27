import { useState } from "react";
import { SettingForm, FormGroup, FormDisplay } from "./SettingForm";

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

  const handleCancel = () => {
    setIsEditing(false);
    setFormData(initialData);
  };

  return (
    <SettingForm
      title="Account Settings"
      description="Manage account credentials and security options."
      isEditing={isEditing}
      onEditChange={setIsEditing}
      onSave={handleSave}
      onCancel={handleCancel}
      breadcrumbs={[
        { label: "Settings", view: "settings" },
        { label: "Account Settings", view: "account" },
      ]}
      onNavigate={onNavigate}
    >
      <FormGroup label="Recovery Email">
        {isEditing ? (
          <input
            type="email"
            className="form-control settings-form-input"
            placeholder="Add recovery email"
            value={formData.recoveryEmail}
            onChange={(e) => handleInputChange("recoveryEmail", e.target.value)}
          />
        ) : (
          <FormDisplay>{formData.recoveryEmail || "Add recovery email"}</FormDisplay>
        )}
      </FormGroup>

      <FormGroup label="Reset Password">
        {isEditing ? (
          <>
            <input
              type="password"
              className="form-control settings-form-input mb-2"
              placeholder="Current Password"
              value={formData.currentPassword}
              onChange={(e) => handleInputChange("currentPassword", e.target.value)}
            />
            <input
              type="password"
              className="form-control settings-form-input"
              placeholder="New Password"
              value={formData.newPassword}
              onChange={(e) => handleInputChange("newPassword", e.target.value)}
            />
          </>
        ) : (
          <FormDisplay>••••••••</FormDisplay>
        )}
      </FormGroup>

      <FormGroup label="Remember Password" isCheckbox>
        <input
          type="checkbox"
          className="form-check-input"
          checked={formData.rememberPassword}
          onChange={(e) => handleInputChange("rememberPassword", e.target.checked)}
          disabled={!isEditing}
        />
      </FormGroup>
    </SettingForm>
  );
};
