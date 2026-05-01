import { useState } from "react";
import { SettingForm } from "./SettingForm";
import "../../assets/css/settings/common.css";
import "../../assets/css/settings/overlays.css";

const initialData = {
    printAfterPayment: true,
    itemCombination: "separate", // "separate" or "combine"
    sortBy: "By Product Name (A–Z)",
    showDiscount: true,
    emailReceipt: false,
};

const sortOptions = [
    "By Added Order",
    "By Product Name (A–Z)",
    "By Category",
    "By Price (Low to High)",
    "By Price (High to Low)",
];

const ReceiptAndPrinting = ({ onNavigate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(initialData);
    const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        setIsEditing(false);
        // Logic to save settings would go here
    };

    const sections = [
        {
            key: "printAfterPayment",
            label: "Print Receipt After Payment",
            helper: "Basic pharmacy information and system display preferences.",
            content: (
                <div className="settings-section-right">
                    <div
                        className="pd-checkbox-container"
                        onClick={() => isEditing && handleInputChange("printAfterPayment", !formData.printAfterPayment)}
                        style={{ justifyContent: "flex-end", width: "100%" }}
                    >
                        <input
                            type="checkbox"
                            className="pd-checkbox"
                            checked={formData.printAfterPayment}
                            disabled={!isEditing}
                            onChange={() => { }}
                        />
                    </div>
                </div>
            ),
        },
        {
            key: "itemCombination",
            label: "Separate or Combine Items",
            helper: "Manage account credentials and security options.",
            content: (
                <div className="settings-flex-column" style={{ gap: "1rem", alignItems: "flex-end" }}>
                    <label
                        className="d-flex align-items-center gap-2"
                        style={{ cursor: isEditing ? "pointer" : "default", fontSize: "0.95rem", color: "#333" }}
                        onClick={() => isEditing && handleInputChange("itemCombination", "separate")}
                    >
                        <input
                            type="radio"
                            name="itemCombination"
                            className="pd-radio"
                            checked={formData.itemCombination === "separate"}
                            disabled={!isEditing}
                            onChange={() => { }}
                        />
                        Separate Items
                    </label>
                    <label
                        className="d-flex align-items-center gap-2"
                        style={{ cursor: isEditing ? "pointer" : "default", fontSize: "0.95rem", color: "#333" }}
                        onClick={() => isEditing && handleInputChange("itemCombination", "combine")}
                    >
                        <input
                            type="radio"
                            name="itemCombination"
                            className="pd-radio"
                            checked={formData.itemCombination === "combine"}
                            disabled={!isEditing}
                            onChange={() => { }}
                        />
                        Combine Items
                    </label>
                </div>
            ),
        },
        {
            key: "sortBy",
            label: "Sort Items in Receipt",
            helper: "Manage account credentials and security options.",
            content: (
                <div className="pd-dropdown-container" style={{ width: "100%", maxWidth: "320px" }}>
                    <button
                        type="button"
                        className="pd-dropdown-btn"
                        style={{
                            background: "#f0f2f5",
                            border: "none",
                            borderRadius: "10px",
                            padding: "0.6rem 1rem",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}
                        onClick={() => isEditing && setIsSortDropdownOpen(!isSortDropdownOpen)}
                        disabled={!isEditing}
                    >
                        <span style={{ color: "#333", fontSize: "0.95rem" }}>{formData.sortBy}</span>
                        <span style={{ fontSize: "0.7rem", color: "#666" }}>▼</span>
                    </button>
                    {isSortDropdownOpen && (
                        <div className="pd-dropdown-menu" style={{ width: "100%", top: "100%" }}>
                            {sortOptions.map((option) => (
                                <div
                                    key={option}
                                    className="pd-dropdown-item"
                                    onClick={() => {
                                        handleInputChange("sortBy", option);
                                        setIsSortDropdownOpen(false);
                                    }}
                                >
                                    {option}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ),
        },
        {
            key: "showDiscount",
            label: "Show Item Discount",
            helper: "Manage account credentials and security options.",
            content: (
                <div className="settings-section-right">
                    <div
                        className="pd-checkbox-container"
                        onClick={() => isEditing && handleInputChange("showDiscount", !formData.showDiscount)}
                        style={{ justifyContent: "flex-end", width: "100%" }}
                    >
                        <input
                            type="checkbox"
                            className="pd-checkbox"
                            checked={formData.showDiscount}
                            disabled={!isEditing}
                            onChange={() => { }}
                        />
                    </div>
                </div>
            ),
        },
        {
            key: "emailReceipt",
            label: "Email Receipt",
            helper: "Manage account credentials and security options.",
            content: (
                <div className="settings-section-right">
                    <div
                        className="pd-checkbox-container"
                        onClick={() => isEditing && handleInputChange("emailReceipt", !formData.emailReceipt)}
                        style={{ justifyContent: "flex-end", width: "100%" }}
                    >
                        <input
                            type="checkbox"
                            className="pd-checkbox"
                            checked={formData.emailReceipt}
                            disabled={!isEditing}
                            onChange={() => { }}
                        />
                    </div>
                </div>
            ),
        },
    ];

    return (
        <SettingForm
            title="Receipt and Printing"
            description="Customize receipt format and printing options."
            isEditing={isEditing}
            onEditChange={setIsEditing}
            onSave={handleSave}
            breadcrumbs={[
                { label: "Settings", view: "settings" },
                { label: "Receipt and Printing", view: "receipt" },
            ]}
            onNavigate={onNavigate}
        >
            <div className="settings-section-list">
                {sections.map((section, index) => (
                    <div
                        key={section.key}
                        className={`settings-section-row${index === sections.length - 1 ? " is-last" : ""}`}
                        style={{ alignItems: "center" }}
                    >
                        <div className="settings-section-left">
                            <p className="settings-section-title">{section.label}</p>
                            <p className="settings-section-helper">{section.helper}</p>
                        </div>
                        <div className="settings-section-right" style={{ justifyContent: "flex-end" }}>
                            {section.content}
                        </div>
                    </div>
                ))}
            </div>
        </SettingForm>
    );
};

export default ReceiptAndPrinting;
