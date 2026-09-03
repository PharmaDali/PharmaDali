import { useEffect, useState } from "react";
import { SettingForm } from "./SettingForm";
import { PageLoader } from "../../shared/components/loading";
import "../../assets/css/settings/common.css";
import {
  getPharmacySettings,
  updatePharmacySettings,
} from "../../services/pharmacySettingsService";

export const ItemExchangeSettings = ({ onNavigate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    allow_item_exchange: true,
    item_exchange_window_days: 1,
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
      const exchangeSettings = res.data?.exchange_settings || {};

      const loadedData = {
        allow_item_exchange: exchangeSettings.allow_item_exchange !== undefined ? Boolean(exchangeSettings.allow_item_exchange) : true,
        item_exchange_window_days: exchangeSettings.item_exchange_window_days ?? 1,
      };

      setFormData(loadedData);
      setSavedData(loadedData);
    } catch (err) {
      setErrorMessage(err.message || "Failed to load item exchange settings.");
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
      setSuccessMessage("Item Exchange policy settings updated successfully.");
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
      key: "allow_item_exchange",
      label: "Enable Item Exchange Feature",
      helper: "Allow pharmacy administrators and staff to process item returns and replacements for completed sales under the store's No Cash Refund Policy.",
      content: (
        <div className="d-flex align-items-center gap-2 w-100" style={{ maxWidth: "300px" }}>
          <div className="form-check form-switch m-0" style={{ fontSize: "16px" }}>
            <input
              className="form-check-input"
              type="checkbox"
              role="switch"
              id="allow_item_exchange"
              checked={formData.allow_item_exchange}
              onChange={(e) => handleInputChange("allow_item_exchange", e.target.checked)}
              disabled={!isEditing || saving}
              style={{ cursor: isEditing ? "pointer" : "not-allowed" }}
            />
            <label className="form-check-label small text-muted ms-2" htmlFor="allow_item_exchange" style={{ cursor: isEditing ? "pointer" : "default" }}>
              {formData.allow_item_exchange ? "Enabled" : "Disabled"}
            </label>
          </div>
        </div>
      ),
    },
    {
      key: "item_exchange_window_days",
      label: "Exchange Window Duration (Days)",
      helper: "Maximum post-purchase duration (in days) allowed for an item exchange. Set to 1 day for strict Same-Day policy within store operating hours.",
      content: (
        <div className="d-flex align-items-center gap-2 flex-wrap w-100" style={{ maxWidth: "300px" }}>
          <input
            type="number"
            className="form-control settings-form-input"
            style={{ maxWidth: "140px" }}
            value={formData.item_exchange_window_days}
            onChange={(e) => handleInputChange("item_exchange_window_days", Math.max(1, Number(e.target.value)))}
            disabled={!isEditing || saving || !formData.allow_item_exchange}
            min="1"
            max="365"
          />
          <span className="small text-muted">{formData.item_exchange_window_days === 1 ? "day (same-day)" : "days"}</span>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <SettingForm
        title="Item Exchange Policy Settings"
        description="Manage item exchange rules, same-day policy enforcement, and return window duration."
        showEditSave={false}
        breadcrumbs={[
          { label: "Settings", view: "settings" },
          { label: "Item Exchange Policy", view: "item_exchange" },
        ]}
        onNavigate={onNavigate}
      >
        <PageLoader
          title="Loading exchange policy settings..."
          subtitle="Please wait a moment while we load pharmacy return rules."
          iconClass="fa-solid fa-rotate"
          minHeight={200}
        />
      </SettingForm>
    );
  }

  return (
    <SettingForm
      title="Item Exchange Policy Settings"
      description="Manage item exchange rules, same-day policy enforcement, and return window duration under No Cash Refund Policy."
      isEditing={isEditing}
      onEditChange={setIsEditing}
      onSave={handleSave}
      onCancel={handleCancel}
      showEditSave={true}
      breadcrumbs={[
        { label: "Settings", view: "settings" },
        { label: "Item Exchange Policy", view: "item_exchange" },
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

      {/* Policy Disclaimer Alert */}
      <div className="alert alert-info py-3 px-3 mb-4 small rounded-3 border-0 text-dark" style={{ backgroundColor: "#e8f0fe", borderLeft: "4px solid var(--pd-primary, #2aabe2)" }}>
        <div className="fw-semibold mb-1 d-flex align-items-center gap-2" style={{ color: "var(--pd-primary, #2aabe2)" }}>
          <i className="fa-solid fa-shield-halved"></i> No Cash Refund Policy Standard
        </div>
        <div className="small text-secondary" style={{ fontSize: "12px", lineHeight: "1.5" }}>
          Item exchanges allow returning items in exchange for replacement products of equal or higher value. If replacement value is lower, excess returned credit is non-refundable (PHP 0.00 cash refund). Each order allows a maximum of 1 item exchange.
        </div>
      </div>

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

export default ItemExchangeSettings;
