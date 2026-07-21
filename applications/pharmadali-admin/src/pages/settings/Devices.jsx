import { useState } from "react";
import { SettingForm } from "./SettingForm";
import "../../assets/css/settings/common.css";

const initialData = {
    useInventoryPrint: true,
    useEODReport: false,
    eodReportType: "summary", // "summary", "detailed", "both"
    defaultReportOutput: {
        printCopy: true,
        saveAsPDF: false
    }
};

const Devices = ({ onNavigate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(initialData);

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleNestedChange = (parent, field, value) => {
        setFormData((prev) => ({
            ...prev,
            [parent]: { ...prev[parent], [field]: value }
        }));
    };

    const handleSave = () => {
        setIsEditing(false);
        // Logic for save settings
    };

    const sections = [
        {
            key: "useInventoryPrint",
            label: "Use Inventory Print",
            helper: "Basic pharmacy information and system display preferences.",
            content: (
                <div className="settings-section-right">
                    <div
                        className="pd-checkbox-container"
                        onClick={() => isEditing && handleInputChange("useInventoryPrint", !formData.useInventoryPrint)}
                        style={{ justifyContent: "flex-end", width: "100%" }}
                    >
                        <input
                            type="checkbox"
                            className="pd-checkbox"
                            checked={formData.useInventoryPrint}
                            disabled={!isEditing}
                            onChange={() => { }}
                        />
                    </div>
                </div>
            ),
        },
        {
            key: "useEODReport",
            label: "Use End of Day Report",
            helper: "Manage account credentials and security options.",
            content: (
                <div className="settings-section-right">
                    <div
                        className="pd-checkbox-container"
                        onClick={() => isEditing && handleInputChange("useEODReport", !formData.useEODReport)}
                        style={{ justifyContent: "flex-end", width: "100%" }}
                    >
                        <input
                            type="checkbox"
                            className="pd-checkbox"
                            checked={formData.useEODReport}
                            disabled={!isEditing}
                            onChange={() => { }}
                        />
                    </div>
                </div>
            ),
        },
        {
            key: "eodReportType",
            label: "End of Day Report Type",
            helper: "Manage account credentials and security options.",
            content: (
                <div className="settings-flex-column" style={{ gap: "0.8rem", width: "fit-content", marginLeft: "auto" }}>
                    {[
                        { label: "Summary", value: "summary" },
                        { label: "Detailed", value: "detailed" },
                        { label: "Summary and Detailed", value: "both" }
                    ].map((option) => (
                        <div
                            key={option.value}
                            className="pd-radio-container"
                            style={{ cursor: isEditing ? "pointer" : "default" }}
                            onClick={() => isEditing && handleInputChange("eodReportType", option.value)}
                        >
                            <input
                                type="radio"
                                className="pd-radio"
                                name="eodReportType"
                                checked={formData.eodReportType === option.value}
                                disabled={!isEditing}
                                onChange={() => { }}
                            />
                            <span className="pd-radio-label">{option.label}</span>
                        </div>
                    ))}
                </div>
            ),
        },
        {
            key: "defaultReportOutput",
            label: "Default Report Output",
            helper: "Manage account credentials and security options.",
            content: (
                <div className="settings-flex-column" style={{ gap: "0.8rem", width: "fit-content", marginLeft: "auto" }}>
                    {[
                        { label: "Print Copy", field: "printCopy" },
                        { label: "Save as PDF", field: "saveAsPDF" }
                    ].map((option) => (
                        <div
                            key={option.field}
                            className="pd-checkbox-container"
                            style={{ cursor: isEditing ? "pointer" : "default" }}
                            onClick={() => isEditing && handleNestedChange("defaultReportOutput", option.field, !formData.defaultReportOutput[option.field])}
                        >
                            <input
                                type="checkbox"
                                className="pd-checkbox"
                                checked={formData.defaultReportOutput[option.field]}
                                disabled={!isEditing}
                                onChange={() => { }}
                            />
                            <span className="pd-checkbox-label">{option.label}</span>
                        </div>
                    ))}
                </div>
            ),
        },
    ];

    return (
        <SettingForm
            title="Devices"
            description="Control payment method and transaction behavior."
            isEditing={isEditing}
            onEditChange={setIsEditing}
            onSave={handleSave}
            breadcrumbs={[
                { label: "Settings", view: "settings" },
                { label: "Devices", view: "devices" },
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

export default Devices;
