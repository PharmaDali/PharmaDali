import { useEffect, useState } from "react";
import { SettingForm } from "./SettingForm";
import { PageLoader } from "../../shared/components/loading";
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
    enable_vat_exemption_discount: false,
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
      const thresholds = res.data?.alert_thresholds || {};
      const discountSettings = res.data?.discount_settings || {};

      const loadedData = {
        low_stock_threshold: thresholds.low_stock ?? 50,
        shortage_days_threshold: thresholds.shortage_days ?? 7,
        expiry_days_threshold: thresholds.expiry_days ?? 30,
        enable_vat_exemption_discount: Boolean(discountSettings.enable_vat_exemption_discount),
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
      setSuccessMessage("Operations and discount rules updated successfully.");
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

  const sections = [
    {
      key: "low_stock_threshold",
      label: "Low Stock Alert Threshold",
      helper: "Trigger a Low Stock alert when a product's total inventory quantity drops below or reaches this unit count.",
      content: (
        <div className="d-flex align-items-center gap-2 flex-wrap w-100" style={{ maxWidth: "320px" }}>
          <input
            type="number"
            className="form-control settings-form-input"
            style={{ maxWidth: "120px" }}
            value={formData.low_stock_threshold}
            onChange={(e) => handleInputChange("low_stock_threshold", Number(e.target.value))}
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
        <div className="d-flex align-items-center gap-2 flex-wrap w-100" style={{ maxWidth: "320px" }}>
          <input
            type="number"
            className="form-control settings-form-input"
            style={{ maxWidth: "120px" }}
            value={formData.shortage_days_threshold}
            onChange={(e) => handleInputChange("shortage_days_threshold", Number(e.target.value))}
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
        <div className="d-flex align-items-center gap-2 flex-wrap w-100" style={{ maxWidth: "320px" }}>
          <input
            type="number"
            className="form-control settings-form-input"
            style={{ maxWidth: "120px" }}
            value={formData.expiry_days_threshold}
            onChange={(e) => handleInputChange("expiry_days_threshold", Number(e.target.value))}
            disabled={!isEditing || saving}
            min="1"
            max="365"
          />
          <span className="small text-muted">days before expiry</span>
        </div>
      ),
    },
    {
      key: "enable_vat_exemption_discount",
      label: "Statutory VAT Exemption for Senior / PWD Discounts",
      helper: "Enable automatic 12% VAT removal prior to applying percentage discounts for Senior Citizen and PWD sales.",
      content: (
        <div className="d-flex align-items-center gap-2 w-100" style={{ maxWidth: "320px" }}>
          <div className="form-check form-switch m-0">
            <input
              className="form-check-input"
              type="checkbox"
              role="switch"
              id="enable_vat_exemption_discount"
              checked={formData.enable_vat_exemption_discount}
              onChange={(e) => handleInputChange("enable_vat_exemption_discount", e.target.checked)}
              disabled={!isEditing || saving}
              style={{ cursor: isEditing ? "pointer" : "not-allowed" }}
            />
            <label className="form-check-label small text-muted ms-2" htmlFor="enable_vat_exemption_discount" style={{ cursor: isEditing ? "pointer" : "default" }}>
              {formData.enable_vat_exemption_discount ? "Enabled" : "Disabled"}
            </label>
          </div>
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
        <PageLoader
          title="Loading operations settings..."
          subtitle="Please wait a moment while we fetch threshold configurations."
          iconClass="fa-solid fa-gears"
          minHeight={200}
        />
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