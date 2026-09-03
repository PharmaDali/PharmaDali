import { useState } from "react";
import { SettingForm } from "./SettingForm";
import SelectDropdown from "../../shared/components/SelectDropdown";
import "../../assets/css/settings/common.css";
import "../../assets/css/settings/overlays.css";

const initialHardwareData = {
  printerName: "POS Thermal Printer (USB)",
  printAfterPayment: true,
  printCopies: 1,
  receiptHeader: "PharmaDali Pharmacy",
  receiptFooter: "Thank you for choosing PharmaDali! Get well soon.",
  sortBy: "By Added Order",
  showDiscount: true,
  showVatBreakdown: true,
};

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
  const [formData, setFormData] = useState(initialHardwareData);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

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
        <div className="pd-checkbox-container" onClick={() => handleInputChange("printAfterPayment", !formData.printAfterPayment)}>
          <input
            type="checkbox"
            className="pd-checkbox"
            checked={formData.printAfterPayment}
            onChange={() => {}}
          />
          <span className="pd-checkbox-label">Print receipt immediately</span>
        </div>
      ),
    },
    {
      key: "receiptHeader",
      label: "Receipt Header Message",
      helper: "Custom banner text printed at the top of receipts.",
      content: (
        <input
          type="text"
          className="form-control settings-form-input"
          value={formData.receiptHeader}
          onChange={(e) => handleInputChange("receiptHeader", e.target.value)}
        />
      ),
    },
    {
      key: "receiptFooter",
      label: "Receipt Footer Message",
      helper: "Closing message printed at the bottom of receipts.",
      content: (
        <textarea
          className="form-control settings-form-input"
          rows="4"
          style={{ minHeight: "100px", resize: "vertical" }}
          value={formData.receiptFooter}
          onChange={(e) => handleInputChange("receiptFooter", e.target.value)}
        />
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
        <div className="pd-checkbox-container" onClick={() => handleInputChange("showDiscount", !formData.showDiscount)}>
          <input
            type="checkbox"
            className="pd-checkbox"
            checked={formData.showDiscount}
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
        <div className="pd-checkbox-container" onClick={() => handleInputChange("showVatBreakdown", !formData.showVatBreakdown)}>
          <input
            type="checkbox"
            className="pd-checkbox"
            checked={formData.showVatBreakdown}
            onChange={() => {}}
          />
          <span className="pd-checkbox-label">Print detailed VAT lines</span>
        </div>
      ),
    },
  ];

  return (
    <SettingForm
      title="Hardware & Receipts"
      description="Configure receipt printers, auto-printing triggers, and receipt formatting."
      showEditSave={false}
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
  );
};

export default HardwareAndReceipts;