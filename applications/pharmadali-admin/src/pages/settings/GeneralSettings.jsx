import { useRef, useState } from "react";
import { SettingForm } from "./SettingForm";

const initialData = {
  pharmacyName: "PharmaDali Branch 1",
  tinNumber: "000-123-456-000",
  contactNumber: "09223344556",
  email: "pharmadali@gmail.com",
  address: "Poblacion 5, Tanauan City, Batangas",
  currency: "PHP (₱)",
  vatRate: "12%",
};

export const GeneralSettings = ({ onNavigate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [savedData, setSavedData] = useState(initialData);
  const [formData, setFormData] = useState(initialData);
  const [logoPreview, setLogoPreview] = useState("/assets/logo-placeholder.png");
  const fileInputRef = useRef(null);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    setSavedData(formData);
    setIsEditing(false);
    // Prepared for backend API PUT /api/pharmacy/settings
  };

  const handleCancel = () => {
    setFormData(savedData);
    setIsEditing(false);
  };

  const handleLogoPick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  const handleLogoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setLogoPreview(previewUrl);
  };

  const sections = [
    {
      key: "pharmacyName",
      label: "Pharmacy Name",
      helper: "Official registered name of this pharmacy store branch.",
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
      key: "tinNumber",
      label: "TIN / Tax License No.",
      helper: "Business Tax Identification Number printed on official receipts.",
      content: (
        <input
          type="text"
          className="form-control settings-form-input"
          value={formData.tinNumber}
          onChange={(e) => handleInputChange("tinNumber", e.target.value)}
          disabled={!isEditing}
        />
      ),
    },
    {
      key: "contactNumber",
      label: "Contact Number",
      helper: "Official store phone or mobile number for store inquiries.",
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
      helper: "Official branch email address for customer communications.",
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
      label: "Physical Address",
      helper: "Store location displayed on customer receipts and app listings.",
      content: (
        <textarea
          className="form-control settings-form-input settings-form-input--singleline"
          rows="2"
          value={formData.address}
          onChange={(e) => handleInputChange("address", e.target.value)}
          disabled={!isEditing}
        />
      ),
    },
    {
      key: "logo",
      label: "Pharmacy Logo",
      helper: "Official logo image displayed on POS receipts and customer app.",
      content: (
        <div className="settings-logo-upload d-flex align-items-center gap-3">
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
              className="btn btn-outline-primary btn-sm rounded-3"
              onClick={handleLogoPick}
            >
              Upload Logo
            </button>
          )}
        </div>
      ),
    },
    {
      key: "currency",
      label: "Currency Symbol",
      helper: "Default currency unit used for transactions and prices.",
      content: (
        <input
          type="text"
          className="form-control settings-form-input bg-light"
          value={formData.currency}
          disabled={true}
        />
      ),
    },
    {
      key: "vatRate",
      label: "Default Tax / VAT Rate",
      helper: "Standard Value Added Tax percentage applied to sales.",
      content: (
        <input
          type="text"
          className="form-control settings-form-input"
          value={formData.vatRate}
          onChange={(e) => handleInputChange("vatRate", e.target.value)}
          disabled={!isEditing}
        />
      ),
    },
  ];

  return (
    <SettingForm
      title="General Settings"
      description="Pharmacy identity, contact details, tax rates, and branding preferences."
      isEditing={isEditing}
      onEditChange={setIsEditing}
      onSave={handleSave}
      onCancel={handleCancel}
      showEditSave={true}
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

export default GeneralSettings;
