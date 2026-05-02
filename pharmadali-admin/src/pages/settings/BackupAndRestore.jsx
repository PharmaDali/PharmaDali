import { useState, useRef } from "react";
import { SettingForm } from "./SettingForm";
import "../../assets/css/settings/common.css";
import selectBackupIcon from "../../assets/icons/settings-icons/select-backup-file.svg";
import warningIcon from "../../assets/icons/settings-icons/warning.svg";
import backupNowIcon from "../../assets/icons/settings-icons/backup-now.svg";
import restoreIcon from "../../assets/icons/settings-icons/restore.svg";

const initialData = {
    backupFrequency: "Daily",
    backupTime: "10:00 PM",
    storageLocation: "local"
};

const BackupAndRestore = ({ onNavigate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(initialData);
    const [restoreFile, setRestoreFile] = useState(null);
    const fileInputRef = useRef(null);

    const handleSave = () => {
        setIsEditing(false);
        // Add save logic here
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setRestoreFile(e.target.files[0]);
        }
    };

    const triggerFileInput = () => {
        if (isEditing) {
            fileInputRef.current?.click();
        }
    };

    return (
        <SettingForm
            title="Backup and Restore"
            description="Handle data backup, recovery, and system restoration."
            isEditing={isEditing}
            onEditChange={setIsEditing}
            onSave={handleSave}
            breadcrumbs={[
                { label: "Settings", view: "settings" },
                { label: "Backup and Restore", view: "backup" },
            ]}
            onNavigate={onNavigate}
            noContainer={true}
        >
            <div className="settings-flex-column" style={{ gap: "2rem" }}>
                {/* Backup Database Card */}
                <div className="settings-card" style={{ marginBottom: 0 }}>
                    <div className="mb-4">
                        <h6 className="settings-section-title" style={{ fontSize: "1.1rem" }}>Backup Database</h6>
                        <p className="settings-section-helper mb-0">Create a backup of your system data to prevent data loss.</p>
                    </div>

                    <div className="row g-4">
                        {/* Left Column: Last Backup */}
                        <div className="col-12 col-md-5 col-lg-4">
                            <div style={{
                                border: "1px solid #b8e0f2",
                                borderRadius: "8px",
                                padding: "1.5rem",
                                backgroundColor: "#f6fbfe",
                                height: "100%",
                                display: "flex",
                                flexDirection: "column"
                            }}>
                                <p className="settings-section-helper mb-1" style={{ fontSize: "0.85rem" }}>Last Backup</p>
                                <h4 style={{ color: "#48aad9", fontWeight: "700", marginBottom: "1.5rem", fontSize: "1.3rem" }}>
                                    May 5, 2026 - 9:00 PM
                                </h4>

                                <div className="d-flex mb-4 gap-4">
                                    <div>
                                        <p className="settings-section-helper mb-1" style={{ fontSize: "0.8rem" }}>Last Backup</p>
                                        <p style={{ fontWeight: "600", color: "#555", margin: 0, fontSize: "0.9rem" }}>124.4 MB</p>
                                    </div>
                                    <div>
                                        <p className="settings-section-helper mb-1" style={{ fontSize: "0.8rem" }}>Last Backup</p>
                                        <p style={{ fontWeight: "600", color: "#555", margin: 0, fontSize: "0.9rem" }}>Local Device</p>
                                    </div>
                                </div>

                                <div className="mt-auto d-flex justify-content-end">
                                    <button className="btn btn-primary d-flex align-items-center gap-2" style={{ padding: "0.5rem 1.5rem", borderRadius: "8px" }} disabled={!isEditing}>
                                        <img src={backupNowIcon} alt="Backup" style={{ width: "18px", height: "18px" }} />
                                        Backup now
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Schedule & Storage */}
                        <div className="col-12 col-md-7 col-lg-8">
                            <h6 className="settings-section-title" style={{ fontSize: "1rem" }}>Backup Schedule</h6>
                            <p className="settings-section-helper mb-3">Automatically backup your database on a regular schedule</p>

                            <div className="row mb-4 g-3">
                                <div className="col-12 col-md-6">
                                    <label className="settings-form-label">Backup Frequency</label>
                                    <select 
                                        className="form-select settings-input"
                                        value={formData.backupFrequency}
                                        onChange={(e) => setFormData({...formData, backupFrequency: e.target.value})}
                                        disabled={!isEditing}
                                    >
                                        <option value="Daily">Daily</option>
                                        <option value="Weekly">Weekly</option>
                                        <option value="Monthly">Monthly</option>
                                    </select>
                                </div>
                                <div className="col-12 col-md-6">
                                    <label className="settings-form-label">Backup Time</label>
                                    <select 
                                        className="form-select settings-input"
                                        value={formData.backupTime}
                                        onChange={(e) => setFormData({...formData, backupTime: e.target.value})}
                                        disabled={!isEditing}
                                    >
                                        <option value="10:00 PM">10:00 PM</option>
                                        <option value="11:00 PM">11:00 PM</option>
                                        <option value="12:00 AM">12:00 AM</option>
                                    </select>
                                </div>
                            </div>

                            <h6 className="settings-section-title" style={{ fontSize: "1rem" }}>Backup Storage Location</h6>
                            <p className="settings-section-helper mb-3">Choose where backup file will be stored</p>

                            <div className="d-flex gap-4">
                                <label className="pd-radio-container">
                                    <input 
                                        type="radio" 
                                        name="storageLocation"
                                        className="pd-radio"
                                        value="local"
                                        checked={formData.storageLocation === "local"}
                                        onChange={(e) => setFormData({...formData, storageLocation: e.target.value})}
                                        disabled={!isEditing}
                                    />
                                    <span className="pd-radio-label">Local Device Storage</span>
                                </label>
                                <label className="pd-radio-container">
                                    <input 
                                        type="radio" 
                                        name="storageLocation"
                                        className="pd-radio"
                                        value="cloud"
                                        checked={formData.storageLocation === "cloud"}
                                        onChange={(e) => setFormData({...formData, storageLocation: e.target.value})}
                                        disabled={!isEditing}
                                    />
                                    <span className="pd-radio-label">Cloud Storage</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Restore System Card */}
                <div className="settings-card" style={{ marginBottom: 0 }}>
                    <div className="mb-4">
                        <h6 className="settings-section-title" style={{ fontSize: "1.1rem" }}>Restore System</h6>
                        <p className="settings-section-helper mb-0">Restore your system using a previously created backup file.</p>
                    </div>

                    <div style={{
                        backgroundColor: "#fffdf0",
                        border: "1px solid #fbe69b",
                        borderRadius: "8px",
                        padding: "1rem 1.5rem",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "1rem",
                        marginBottom: "2rem"
                    }}>
                        <img src={warningIcon} alt="Warning" style={{ width: "24px", height: "24px", marginTop: "2px" }} />
                        <div>
                            <h6 style={{ fontSize: "0.95rem", fontWeight: "600", color: "#666", marginBottom: "0.25rem" }}>Important warning</h6>
                            <p style={{ margin: 0, fontSize: "0.9rem", color: "#777" }}>This action will overwrite current system data. This cannot be undone.</p>
                        </div>
                    </div>

                    <div className="row g-4">
                        {/* Left Column: Select Backup File */}
                        <div className="col-12 col-md-6">
                            <h6 className="settings-section-title" style={{ fontSize: "1rem", marginBottom: "1rem" }}>Select Backup File</h6>
                            <div 
                                style={{
                                    border: "1px solid #b8e0f2",
                                    borderRadius: "8px",
                                    padding: "2rem 1.5rem",
                                    backgroundColor: "#fff",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "1.5rem",
                                    cursor: isEditing ? "pointer" : "default",
                                    height: "140px"
                                }}
                                onClick={triggerFileInput}
                            >
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    style={{ display: "none" }} 
                                    accept=".sql,.bak"
                                    onChange={handleFileChange}
                                />
                                <img src={selectBackupIcon} alt="Upload" style={{ width: "48px", height: "48px" }} />
                                <div className="d-flex align-items-center gap-3">
                                    <div>
                                        <p style={{ fontSize: "0.95rem", fontWeight: "500", color: "#555", margin: 0 }}>
                                            {restoreFile ? restoreFile.name : "Drag and drop your backup file here."}
                                        </p>
                                        <p className="settings-section-helper mb-0" style={{ fontSize: "0.75rem" }}>
                                            Supported format: .sql   Maximum size: 500 MB
                                        </p>
                                    </div>
                                    {!restoreFile && (
                                        <>
                                            <span style={{ fontSize: "0.9rem", color: "#999" }}>or</span>
                                            <button 
                                                className="btn btn-outline-primary btn-sm px-3" 
                                                disabled={!isEditing}
                                                style={{ borderRadius: "20px", fontSize: "0.85rem", borderColor: "#b8e0f2" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    triggerFileInput();
                                                }}
                                            >
                                                Choose file
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Restore Information */}
                        <div className="col-12 col-md-6">
                            <h6 className="settings-section-title" style={{ fontSize: "1rem", marginBottom: "1rem" }}>Restore Information</h6>
                            
                            <div style={{
                                border: "1px solid #b8e0f2",
                                borderRadius: "8px",
                                padding: "1.5rem",
                                backgroundColor: "#f6fbfe",
                                marginBottom: "1rem"
                            }}>
                                <div className="d-flex align-items-start gap-3 mb-3">
                                    <div style={{ width: "20px", height: "20px", borderRadius: "50%", border: "2px solid #48aad9", display: "flex", alignItems: "center", justifyContent: "center", marginTop: "2px" }}>
                                        <span style={{ color: "#48aad9", fontSize: "12px", fontWeight: "bold" }}>✓</span>
                                    </div>
                                    <div>
                                        <h6 style={{ fontSize: "0.9rem", fontWeight: "600", color: "#555", marginBottom: "0.1rem" }}>Make sure the backup file is recent</h6>
                                        <p style={{ margin: 0, fontSize: "0.8rem", color: "#888" }}>Use the latest backup for best results</p>
                                    </div>
                                </div>
                                <div className="d-flex align-items-start gap-3 mb-3">
                                    <div style={{ width: "20px", height: "20px", borderRadius: "50%", border: "2px solid #48aad9", display: "flex", alignItems: "center", justifyContent: "center", marginTop: "2px" }}>
                                        <span style={{ color: "#48aad9", fontSize: "12px", fontWeight: "bold" }}>✓</span>
                                    </div>
                                    <div>
                                        <h6 style={{ fontSize: "0.9rem", fontWeight: "600", color: "#555", marginBottom: "0.1rem" }}>All current data will be replaced</h6>
                                        <p style={{ margin: 0, fontSize: "0.8rem", color: "#888" }}>Product, sales, inventory and other data will be overwritten.</p>
                                    </div>
                                </div>
                                <div className="d-flex align-items-start gap-3">
                                    <div style={{ width: "20px", height: "20px", borderRadius: "50%", border: "2px solid #48aad9", display: "flex", alignItems: "center", justifyContent: "center", marginTop: "2px" }}>
                                        <span style={{ color: "#48aad9", fontSize: "12px", fontWeight: "bold" }}>✓</span>
                                    </div>
                                    <div>
                                        <h6 style={{ fontSize: "0.9rem", fontWeight: "600", color: "#555", marginBottom: "0.1rem" }}>System will restart after restore</h6>
                                        <p style={{ margin: 0, fontSize: "0.8rem", color: "#888" }}>Product, sales, inventory and other data will be overwritten.</p>
                                    </div>
                                </div>
                            </div>

                            <button 
                                className="btn btn-danger w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                                style={{ borderRadius: "8px", backgroundColor: "#ff4d4f", borderColor: "#ff4d4f", fontWeight: "600" }}
                                disabled={!isEditing || !restoreFile}
                            >
                                <img src={restoreIcon} alt="Restore" style={{ width: "22px", height: "22px" }} />
                                Restore system
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </SettingForm>
    );
};

export default BackupAndRestore;
