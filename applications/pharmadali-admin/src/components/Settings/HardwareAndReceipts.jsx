import { useState, useEffect } from "react";
import { SettingForm } from "./SettingForm";
import SelectDropdown from "../../shared/components/SelectDropdown";
import { PageLoader } from "../../shared/components/loading";
import ToastNotification from "../../shared/components/ToastNotification";
import {
  getPharmacySettings,
  updatePharmacySettings,
} from "../../services/pharmacySettingsService";
import "../../assets/css/settings/common.css";
import "../../assets/css/settings/overlays.css";

const sortOptions = [
  "By Added Order",
  "By Product Name (A–Z)",
  "By Category",
  "By Price (Low to High)",
  "By Price (High to Low)",
];

const printerOptions = [
  { label: "POS Thermal Printer (USB / 80mm)", value: "POS Thermal Printer (USB)" },
  { label: "Network Thermal Printer (IP / 80mm)", value: "Network Thermal Printer (IP)" },
  { label: "System Default Printer", value: "System Default Printer" },
];

export const HardwareAndReceipts = ({ onNavigate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success", title: "Notice" });

  const [formData, setFormData] = useState({
    printerName: "POS Thermal Printer (USB)",
    printAfterPayment: false,
    receiptHeader: "",
    receiptFooter: "Thank you for choosing PharmaDali! Get well soon.",
    sortBy: "By Added Order",
    showDiscount: true,
    showVatBreakdown: true,
  });

  const [savedData, setSavedData] = useState({ ...formData });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await getPharmacySettings();
      const hardware = res.data?.hardware_settings || {};
      const pharmacyName = res.data?.pharmacy?.pharmacy_name || "PharmaDali Pharmacy";

      const loadedData = {
        printerName: hardware.printer_name || "POS Thermal Printer (USB)",
        printAfterPayment: hardware.print_after_payment ?? true,
        receiptHeader: hardware.receipt_header || pharmacyName,
        receiptFooter: hardware.receipt_footer || `Thank you for choosing ${pharmacyName}! Get well soon.`,
        sortBy: hardware.receipt_sort_by || "By Added Order",
        showDiscount: hardware.show_discount_on_receipt ?? true,
        showVatBreakdown: hardware.show_vat_breakdown_on_receipt ?? true,
      };

      setFormData(loadedData);
      setSavedData(loadedData);
    } catch (err) {
      console.error("Failed to load hardware & receipt settings:", err);
      setToast({
        show: true,
        title: "Error",
        message: "Failed to load hardware settings from server.",
        type: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (!isEditing) return;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancel = () => {
    setFormData({ ...savedData });
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        printer_name: formData.printerName,
        print_after_payment: formData.printAfterPayment,
        receipt_header: formData.receiptHeader,
        receipt_footer: formData.receiptFooter,
        receipt_sort_by: formData.sortBy,
        show_discount_on_receipt: formData.showDiscount,
        show_vat_breakdown_on_receipt: formData.showVatBreakdown,
      };

      await updatePharmacySettings(payload);
      setSavedData({ ...formData });
      setIsEditing(false);
      setToast({
        show: true,
        title: "Success",
        message: "Hardware & receipt settings updated successfully.",
        type: "success",
      });
    } catch (err) {
      console.error("Failed to save hardware & receipt settings:", err);
      setToast({
        show: true,
        title: "Error",
        message: err?.response?.data?.message || "Failed to update hardware settings.",
        type: "danger",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <PageLoader message="Loading hardware & receipt settings..." />;
  }

  const sections = [
    {
      key: "printerName",
      label: "Default POS Receipt Printer",
      helper: "Select connected thermal printer or print service output.",
      content: (
        <SelectDropdown
          id="printerName"
          value={formData.printerName}
          onChange={(val) => handleInputChange("printerName", val)}
          options={printerOptions}
          placeholder="Select printer"
          disabled={!isEditing || saving}
          selectClassName="settings-form-input"
          containerClassName="w-100"
        />
      ),
    },
    {
      key: "printAfterPayment",
      label: "Auto-Print Receipt",
      helper: "Automatically print receipt upon checkout & payment completion.",
      content: (
        <div
          className={`pd-checkbox-container${!isEditing ? " disabled" : ""}`}
          onClick={() => isEditing && handleInputChange("printAfterPayment", !formData.printAfterPayment)}
          style={{ opacity: !isEditing ? 0.7 : 1, cursor: !isEditing ? "not-allowed" : "pointer" }}
        >
          <input
            type="checkbox"
            className="pd-checkbox"
            checked={formData.printAfterPayment}
            disabled={!isEditing || saving}
            onChange={() => {}}
          />
          <span className="pd-checkbox-label">Print receipt immediately</span>
        </div>
      ),
    },
    {
      key: "receiptHeader",
      label: "Receipt Header Message",
      helper: "Custom banner text printed at the top of receipts (defaults to pharmacy name).",
      content: (
        <input
          type="text"
          className="form-control settings-form-input"
          value={formData.receiptHeader}
          disabled={!isEditing || saving}
          onChange={(e) => handleInputChange("receiptHeader", e.target.value)}
        />
      ),
    },
    {
      key: "receiptFooter",
      label: "Receipt Footer Message",
      helper: "Closing message printed at the bottom of receipts (max 150 characters).",
      content: (
        <div>
          <textarea
            className="form-control settings-form-input"
            rows="3"
            maxLength={150}
            disabled={!isEditing || saving}
            style={{ minHeight: "90px", resize: "vertical" }}
            value={formData.receiptFooter}
            onChange={(e) => handleInputChange("receiptFooter", e.target.value.slice(0, 150))}
          />
          <div className="text-end text-muted mt-1" style={{ fontSize: "11px" }}>
            {formData.receiptFooter.length}/150 characters
          </div>
        </div>
      ),
    },
    {
      key: "sortBy",
      label: "Sort Receipt Items",
      helper: "Order of line items printed on physical receipt.",
      content: (
        <SelectDropdown
          id="sortBy"
          value={formData.sortBy}
          onChange={(val) => handleInputChange("sortBy", val)}
          options={sortOptions.map((opt) => ({ label: opt, value: opt }))}
          placeholder="Select sort order"
          disabled={!isEditing || saving}
          selectClassName="settings-form-input"
          containerClassName="w-100"
        />
      ),
    },
    {
      key: "showDiscount",
      label: "Show Discount Details",
      helper: "Print item-level discount rates and promos on receipt.",
      content: (
        <div
          className={`pd-checkbox-container${!isEditing ? " disabled" : ""}`}
          onClick={() => isEditing && handleInputChange("showDiscount", !formData.showDiscount)}
          style={{ opacity: !isEditing ? 0.7 : 1, cursor: !isEditing ? "not-allowed" : "pointer" }}
        >
          <input
            type="checkbox"
            className="pd-checkbox"
            checked={formData.showDiscount}
            disabled={!isEditing || saving}
            onChange={() => {}}
          />
          <span className="pd-checkbox-label">Display item discounts</span>
        </div>
      ),
    },
    {
      key: "showVatBreakdown",
      label: "Show VAT Breakdown",
      helper: "Display VAT-able Sales, VAT Amount (12%), and VAT Exempt totals.",
      content: (
        <div
          className={`pd-checkbox-container${!isEditing ? " disabled" : ""}`}
          onClick={() => isEditing && handleInputChange("showVatBreakdown", !formData.showVatBreakdown)}
          style={{ opacity: !isEditing ? 0.7 : 1, cursor: !isEditing ? "not-allowed" : "pointer" }}
        >
          <input
            type="checkbox"
            className="pd-checkbox"
            checked={formData.showVatBreakdown}
            disabled={!isEditing || saving}
            onChange={() => {}}
          />
          <span className="pd-checkbox-label">Print detailed VAT lines</span>
        </div>
      ),
    },
  ];

  return (
    <>
      <SettingForm
        title="Hardware & Receipts"
        description="Configure receipt printers, auto-printing triggers, and receipt formatting."
        isEditing={isEditing}
        onEditChange={setIsEditing}
        onSave={handleSave}
        onCancel={handleCancel}
        showEditSave={true}
        breadcrumbs={[
          { label: "Settings", view: "settings" },
          { label: "Hardware & Receipts", view: "hardware" },
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

      {toast.show && (
        <ToastNotification
          title={toast.title}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast((prev) => ({ ...prev, show: false }))}
        />
      )}
    </>
  );
};

export default HardwareAndReceipts;