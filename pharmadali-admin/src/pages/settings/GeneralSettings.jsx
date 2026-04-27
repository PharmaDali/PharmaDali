import { useState } from "react";
import { SettingForm, FormGroup, FormDisplay } from "./SettingForm";

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
      title="General Settings"
      description="Basic pharmacy information and system display preferences."
      isEditing={isEditing}
      onEditChange={setIsEditing}
      onSave={handleSave}
      onCancel={handleCancel}
      breadcrumbs={[
        { label: "Settings", view: "settings" },
        { label: "General Settings", view: "general" },
      ]}
      onNavigate={onNavigate}
    >
      <FormGroup label="Pharmacy name">
        {isEditing ? (
          <input
            type="text"
            className="form-control settings-form-input"
            value={formData.pharmacyName}
            onChange={(e) => handleInputChange("pharmacyName", e.target.value)}
          />
        ) : (
          <FormDisplay>{formData.pharmacyName}</FormDisplay>
        )}
      </FormGroup>

      <FormGroup label="Contact Number">
        {isEditing ? (
          <input
            type="tel"
            className="form-control settings-form-input"
            value={formData.contactNumber}
            onChange={(e) => handleInputChange("contactNumber", e.target.value)}
          />
        ) : (
          <FormDisplay>{formData.contactNumber}</FormDisplay>
        )}
      </FormGroup>

      <FormGroup label="Email Address">
        {isEditing ? (
          <input
            type="email"
            className="form-control settings-form-input"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
          />
        ) : (
          <FormDisplay>{formData.email}</FormDisplay>
        )}
      </FormGroup>

      <FormGroup label="Address">
        {isEditing ? (
          <textarea
            className="form-control settings-form-input"
            rows="3"
            value={formData.address}
            onChange={(e) => handleInputChange("address", e.target.value)}
          />
        ) : (
          <FormDisplay>{formData.address}</FormDisplay>
        )}
      </FormGroup>

      <FormGroup label="Logo Upload">
        <div className="settings-logo-upload">
          <div className="settings-logo-placeholder">
            <img src="/assets/logo-placeholder.png" alt="Pharmacy Logo" className="settings-logo-image" />
          </div>
          {isEditing && <button className="btn btn-outline-primary btn-sm">Upload</button>}
        </div>
      </FormGroup>

      <FormGroup label="Date Format">
        {isEditing ? (
          <select
            className="form-select settings-form-input"
            value={formData.dateFormat}
            onChange={(e) => handleInputChange("dateFormat", e.target.value)}
          >
            <option>MM-DD-YYYY</option>
            <option>DD-MM-YYYY</option>
            <option>YYYY-MM-DD</option>
          </select>
        ) : (
          <FormDisplay>{formData.dateFormat}</FormDisplay>
        )}
      </FormGroup>
    </SettingForm>
  );
};
