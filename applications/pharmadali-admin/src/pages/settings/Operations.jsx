import { useEffect, useState } from "react";
import { SettingForm } from "./SettingForm";
import "../../assets/css/settings/common.css";
import {
  getPharmacySettings,
  updatePharmacySettings,
} from "../../services/pharmacySettingsService";

export const Operations = ({ onNavigate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    low_stock_threshold: 50,
    shortage_days_threshold: 7,
    expiry_days_threshold: 30,
  });

  const [savedData, setSavedData] = useState({ ...formData });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const res = await getPharmacySettings();
      const thresholds = res.alert_thresholds || {};

      const loadedData = {
        low_stock_threshold: thresholds.low_stock ?? 50,
        shortage_days_threshold: thresholds.shortage_days ?? 7,
        expiry_days_threshold: thresholds.expiry_days ?? 30,
      };

      setFormData(loadedData);
      setSavedData(loadedData);
    } catch (err) {
      setErrorMessage(err.message || "Failed to load threshold settings.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: Number(value) }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      await updatePharmacySettings(formData);

      setSavedData(formData);
      setIsEditing(false);
      setSuccessMessage("Alert threshold rules updated successfully.");
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      setErrorMessage(err.message || "Failed to save threshold settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(savedData);
    setIsEditing(false);
    setErrorMessage("");
  };

  const sections = [
    {
      key: "low_stock_threshold",
      label: "Low Stock Alert Threshold",
      helper: "Trigger a Low Stock alert when a product's total inventory quantity drops below or reaches this unit count.",
      content: (
        <div className="d-flex align-items-center gap-2" style={{ maxWidth: "240px" }}>
          <input
            type="number"
            className="form-control settings-form-input"
            value={formData.low_stock_threshold}
            onChange={(e) => handleInputChange("low_stock_threshold", e.target.value)}
            disabled={!isEditing || saving}
            min="1"
          />
          <span className="small text-muted">units</span>
        </div>
      ),
    },
    {
      key: "shortage_days_threshold",
      label: "Shortage Alert Notice (Days of Stock)",
      helper: "Warn staff with a Shortage Alert when projected remaining supply duration drops to or below this many days.",
      content: (
        <div className="d-flex align-items-center gap-2" style={{ maxWidth: "240px" }}>
          <input
            type="number"
            className="form-control settings-form-input"
            value={formData.shortage_days_threshold}
            onChange={(e) => handleInputChange("shortage_days_threshold", e.target.value)}
            disabled={!isEditing || saving}
            min="1"
            max="365"
          />
          <span className="small text-muted">days remaining</span>
        </div>
      ),
    },
    {
      key: "expiry_days_threshold",
      label: "Product Expiry Warning Notice Window",
      helper: "Warn staff with an Expiry Warning when a product batch is scheduled to expire within this many days.",
      content: (
        <div className="d-flex align-items-center gap-2" style={{ maxWidth: "240px" }}>
          <input
            type="number"
            className="form-control settings-form-input"
            value={formData.expiry_days_threshold}
            onChange={(e) => handleInputChange("expiry_days_threshold", e.target.value)}
            disabled={!isEditing || saving}
            min="1"
            max="365"
          />
          <span className="small text-muted">days before expiry</span>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <SettingForm
        title="Operations & Thresholds"
        description="Configure dynamic inventory low stock thresholds, shortage prediction windows, and expiry warning alerts."
        showEditSave={false}
        breadcrumbs={[
          { label: "Settings", view: "settings" },
          { label: "Operations & Thresholds", view: "operations" },
        ]}
        onNavigate={onNavigate}
      >
        <div className="text-center py-5 text-muted">
          <div className="spinner-border spinner-border-sm me-2" style={{ color: "#2aabe2" }} role="status" />
          Loading threshold settings...
        </div>
      </SettingForm>
    );
  }

  return (
    <SettingForm
      title="Operations & Thresholds"
      description="Configure dynamic inventory low stock thresholds, shortage prediction windows, and expiry warning alerts."
      isEditing={isEditing}
      onEditChange={setIsEditing}
      onSave={handleSave}
      onCancel={handleCancel}
      showEditSave={true}
      breadcrumbs={[
        { label: "Settings", view: "settings" },
        { label: "Operations & Thresholds", view: "operations" },
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

export default Operations;
