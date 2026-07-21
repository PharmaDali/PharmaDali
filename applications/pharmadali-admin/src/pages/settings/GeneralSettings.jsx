import { useRef, useState } from "react";
import { SettingForm } from "./SettingForm";

const initialData = {
  pharmacyName: "PureMed Pharmacy",
  contactNumber: "09223344556",
  email: "pureMedpharmacy@gmail.com",
  address: "Poblacion 5, Tanauan City, Batangas",
  dateFormat: "MM-DD-YYYY",
};

export const GeneralSettings = ({ onNavigate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(initialData);
  const [logoPreview, setLogoPreview] = useState("/assets/logo-placeholder.png");
  const fileInputRef = useRef(null);

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

  const handleLogoPick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  const handleLogoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setLogoPreview(previewUrl);
  };

  const sections = [
    {
      key: "pharmacyName",
      label: "Pharmacy name",
      helper: "Basic pharmacy information and system display preferences.",
      content: (
        <input
          type="text"
          className="form-control settings-form-input"
          value={formData.pharmacyName}
          onChange={(e) => handleInputChange("pharmacyName", e.target.value)}
          disabled={!isEditing}
        />
      ),
    },
    {
      key: "contactNumber",
      label: "Contact Number",
      helper: "Manage account credentials and security options.",
      content: (
        <input
          type="tel"
          className="form-control settings-form-input"
          value={formData.contactNumber}
          onChange={(e) => handleInputChange("contactNumber", e.target.value)}
          disabled={!isEditing}
        />
      ),
    },
    {
      key: "email",
      label: "Email Address",
      helper: "Configure product categories, items, and pricing rules.",
      content: (
        <input
          type="email"
          className="form-control settings-form-input"
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          disabled={!isEditing}
        />
      ),
    },
    {
      key: "address",
      label: "Address",
      helper: "Control payment methods and transaction behavior.",
      content: (
        <textarea
          className="form-control settings-form-input settings-form-input--singleline"
          rows="1"
          value={formData.address}
          onChange={(e) => handleInputChange("address", e.target.value)}
          disabled={!isEditing}
        />
      ),
    },
    {
      key: "logo",
      label: "Logo Upload",
      helper: "Customize receipt format and printing options.",
      content: (
        <div className="settings-logo-upload">
          <div className="settings-logo-placeholder">
            <img src={logoPreview} alt="Pharmacy Logo" className="settings-logo-image" />
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="d-none"
            onChange={handleLogoChange}
          />
          {isEditing && (
            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={handleLogoPick}
            >
              Upload
            </button>
          )}
        </div>
      ),
    },
    {
      key: "dateFormat",
      label: "Date Format",
      helper: "Set up and manage connected hardware devices.",
      content: (
        <select
          className="form-select settings-form-input"
          value={formData.dateFormat}
          onChange={(e) => handleInputChange("dateFormat", e.target.value)}
          disabled={!isEditing}
        >
          <option>MM-DD-YYYY</option>
          <option>DD-MM-YYYY</option>
          <option>YYYY-MM-DD</option>
        </select>
      ),
    },
  ];

  return (
    <SettingForm
      title="General Settings"
      description="Basic pharmacy information and system display preferences."
      isEditing={isEditing}
      onEditChange={setIsEditing}
      onSave={handleSave}
      breadcrumbs={[
        { label: "Settings", view: "settings" },
        { label: "General Settings", view: "general" },
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
