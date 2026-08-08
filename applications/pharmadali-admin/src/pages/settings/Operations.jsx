import { useState } from "react";
import { SettingForm } from "./SettingForm";
import "../../assets/css/settings/common.css";

const initialOperationsData = {
  useEODReport: true,
  eodReportType: "summary", // "summary", "detailed", "both"
  defaultReportOutput: {
    printCopy: false,
    saveAsPDF: true,
  },
  lowStockThreshold: 50,
  autoExpireUnclaimedOrders: true,
};

export const Operations = ({ onNavigate }) => {
  const [formData, setFormData] = useState(initialOperationsData);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value },
    }));
  };

  const sections = [
    {
      key: "useEODReport",
      label: "Enable End of Day (EOD) Reports",
      helper: "Automatically compile daily sales and inventory summary upon shift register close.",
      content: (
        <div className="pd-checkbox-container" onClick={() => handleInputChange("useEODReport", !formData.useEODReport)}>
          <input
            type="checkbox"
            className="pd-checkbox"
            checked={formData.useEODReport}
            onChange={() => {}}
          />
          <span className="pd-checkbox-label">Generate EOD report on register close</span>
        </div>
      ),
    },
    {
      key: "eodReportType",
      label: "EOD Report Detail Level",
      helper: "Choose report granularity for end of day operational closing.",
      content: (
        <div className="d-flex flex-column gap-2">
          {[
            { label: "Summary Only (Total Sales & Payments)", value: "summary" },
            { label: "Detailed (Line Items & Batch Deductions)", value: "detailed" },
            { label: "Summary and Detailed Both", value: "both" },
          ].map((option) => (
            <div
              key={option.value}
              className="pd-radio-container"
              style={{ cursor: "pointer" }}
              onClick={() => handleInputChange("eodReportType", option.value)}
            >
              <input
                type="radio"
                className="pd-radio"
                name="eodReportType"
                checked={formData.eodReportType === option.value}
                onChange={() => {}}
              />
              <span className="pd-radio-label">{option.label}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      key: "defaultReportOutput",
      label: "EOD Report Export Format",
      helper: "Default output destination when generating daily operational reports.",
      content: (
        <div className="d-flex flex-column gap-2">
          {[
            { label: "Print Hard Copy", field: "printCopy" },
            { label: "Save Digital PDF Copy", field: "saveAsPDF" },
          ].map((option) => (
            <div
              key={option.field}
              className="pd-checkbox-container"
              style={{ cursor: "pointer" }}
              onClick={() => handleNestedChange("defaultReportOutput", option.field, !formData.defaultReportOutput[option.field])}
            >
              <input
                type="checkbox"
                className="pd-checkbox"
                checked={formData.defaultReportOutput[option.field]}
                onChange={() => {}}
              />
              <span className="pd-checkbox-label">{option.label}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      key: "lowStockThreshold",
      label: "Default Low Stock Threshold",
      helper: "Default stock quantity limit (units) to trigger real-time low inventory alerts.",
      content: (
        <div className="d-flex align-items-center gap-2" style={{ maxWidth: "200px" }}>
          <input
            type="number"
            className="form-control settings-form-input"
            value={formData.lowStockThreshold}
            onChange={(e) => handleInputChange("lowStockThreshold", Number(e.target.value))}
            min="1"
          />
          <span className="small text-muted">units</span>
        </div>
      ),
    },
    {
      key: "autoExpireUnclaimedOrders",
      label: "Auto-Expire Unclaimed Pickup Orders",
      helper: "Automatically flag in-store pickup orders as overdue when unclaimed after 48 hours.",
      content: (
        <div className="pd-checkbox-container" onClick={() => handleInputChange("autoExpireUnclaimedOrders", !formData.autoExpireUnclaimedOrders)}>
          <input
            type="checkbox"
            className="pd-checkbox"
            checked={formData.autoExpireUnclaimedOrders}
            onChange={() => {}}
          />
          <span className="pd-checkbox-label">Auto-flag overdue pickup orders</span>
        </div>
      ),
    },
  ];

  return (
    <SettingForm
      title="Operations & Reports"
      description="Set up End-of-Day report preferences and operational inventory rules."
      showEditSave={false}
      breadcrumbs={[
        { label: "Settings", view: "settings" },
        { label: "Operations & Reports", view: "operations" },
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

export default Operations;
