import { useEffect, useRef, useState } from "react";
import { SettingForm } from "./SettingForm";
import {
  getPharmacySettings,
  updatePharmacySettings,
  uploadPharmacyLogo,
} from "../../services/pharmacySettingsService";

export const GeneralSettings = ({ onNavigate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    pharmacy_name: "",
    contact_number: "",
    email: "",
    location: "",
    opening_hour: "09:00",
    closing_hour: "21:00",
  });

  const [savedData, setSavedData] = useState({ ...formData });
  const [logoPreview, setLogoPreview] = useState("/assets/logo-placeholder.png");
  const fileInputRef = useRef(null);

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const res = await getPharmacySettings();
      const pharmacy = res.pharmacy || {};

      const loadedData = {
        pharmacy_name: pharmacy.pharmacy_name || "",
        contact_number: pharmacy.contact_number || "",
        email: pharmacy.email || "",
        location: pharmacy.location || "",
        opening_hour: pharmacy.opening_hour ? pharmacy.opening_hour.substring(0, 5) : "09:00",
        closing_hour: pharmacy.closing_hour ? pharmacy.closing_hour.substring(0, 5) : "21:00",
      };

      setFormData(loadedData);
      setSavedData(loadedData);
      if (pharmacy.logo_url) {
        setLogoPreview(pharmacy.logo_url);
      }
    } catch (err) {
      setErrorMessage(err.message || "Failed to load pharmacy settings.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      await updatePharmacySettings(formData);

      setSavedData(formData);
      setIsEditing(false);
      setSuccessMessage("Pharmacy settings saved successfully.");
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      setErrorMessage(err.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(savedData);
    setIsEditing(false);
    setErrorMessage("");
  };

  const handleLogoPick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  const handleLogoChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const previewUrl = URL.createObjectURL(file);
    setLogoPreview(previewUrl);

    try {
      setErrorMessage("");
      const res = await uploadPharmacyLogo(file);
      if (res.logo_url) {
        setLogoPreview(res.logo_url);
        setSuccessMessage("Pharmacy logo uploaded successfully.");
        setTimeout(() => setSuccessMessage(""), 4000);
      }
    } catch (err) {
      setErrorMessage(err.message || "Failed to upload logo.");
    }
  };

  const sections = [
    {
      key: "pharmacy_name",
      label: "Pharmacy Name",
      helper: "Official registered name of this pharmacy store branch.",
      content: (
        <input
          type="text"
          className="form-control settings-form-input"
          value={formData.pharmacy_name}
          onChange={(e) => handleInputChange("pharmacy_name", e.target.value)}
          disabled={!isEditing || saving}
        />
      ),
    },
    {
      key: "contact_number",
      label: "Contact Number",
      helper: "Official store phone or mobile number for customer inquiries.",
      content: (
        <input
          type="tel"
          className="form-control settings-form-input"
          value={formData.contact_number}
          onChange={(e) => handleInputChange("contact_number", e.target.value)}
          disabled={!isEditing || saving}
        />
      ),
    },
    {
      key: "email",
      label: "Email Address",
      helper: "Official branch email address for store communications.",
      content: (
        <input
          type="email"
          className="form-control settings-form-input"
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          disabled={!isEditing || saving}
        />
      ),
    },
    {
      key: "location",
      label: "Physical Address / Location",
      helper: "Store location displayed on customer receipts and app listings.",
      content: (
        <textarea
          className="form-control settings-form-input settings-form-input--singleline"
          rows="2"
          value={formData.location}
          onChange={(e) => handleInputChange("location", e.target.value)}
          disabled={!isEditing || saving}
        />
      ),
    },
    {
      key: "operating_hours",
      label: "Operating Hours",
      helper: "Standard daily opening and closing schedule for the store.",
      content: (
        <div className="d-flex align-items-center gap-2">
          <div className="d-flex flex-column">
            <span className="small text-muted mb-1">Opening Time</span>
            <input
              type="time"
              className="form-control settings-form-input"
              value={formData.opening_hour}
              onChange={(e) => handleInputChange("opening_hour", e.target.value)}
              disabled={!isEditing || saving}
            />
          </div>
          <span className="mt-4 text-muted font-monospace">–</span>
          <div className="d-flex flex-column">
            <span className="small text-muted mb-1">Closing Time</span>
            <input
              type="time"
              className="form-control settings-form-input"
              value={formData.closing_hour}
              onChange={(e) => handleInputChange("closing_hour", e.target.value)}
              disabled={!isEditing || saving}
            />
          </div>
        </div>
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
              disabled={saving}
            >
              Upload Logo
            </button>
          )}
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <SettingForm
        title="General Settings"
        description="Pharmacy identity, contact details, operating hours, and branding."
        showEditSave={false}
        breadcrumbs={[
          { label: "Settings", view: "settings" },
          { label: "General Settings", view: "general" },
        ]}
        onNavigate={onNavigate}
      >
        <div className="text-center py-5 text-muted">
          <div className="spinner-border spinner-border-sm me-2" style={{ color: "#2aabe2" }} role="status" />
          Loading settings...
        </div>
      </SettingForm>
    );
  }

  return (
    <SettingForm
      title="General Settings"
      description="Pharmacy identity, contact details, operating hours, and branding."
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
