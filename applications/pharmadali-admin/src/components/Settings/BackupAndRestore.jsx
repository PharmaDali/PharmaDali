import { useState, useRef } from "react";
import { SettingForm } from "./SettingForm";
import "../../assets/css/settings/common.css";
import selectBackupIcon from "../../assets/icons/settings-icons/select-backup-file.svg";
import warningIcon from "../../assets/icons/settings-icons/warning.svg";
import backupNowIcon from "../../assets/icons/settings-icons/backup-now.svg";
import restoreIcon from "../../assets/icons/settings-icons/restore.svg";

const BackupAndRestore = ({ onNavigate }) => {
  const [restoreFile, setRestoreFile] = useState(null);
  const [lastBackup, setLastBackup] = useState({
    timestamp: "May 5, 2026 - 9:00 PM",
    size: "124.4 MB",
    location: "Local Download",
  });
  const [isBackingUp, setIsBackingUp] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setRestoreFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleBackupNow = () => {
    setIsBackingUp(true);
    setTimeout(() => {
      setIsBackingUp(false);
      const now = new Date();
      setLastBackup({
        timestamp: `${now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} - ${now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`,
        size: "128.2 MB",
        location: "Local Download",
      });
      // Prepared for backend API endpoint `/api/pharmacy/backup/download`
    }, 1200);
  };

  return (
    <SettingForm
      title="Backup & Restore"
      description="Create snapshots and restore pharmacy tenant database backups."
      showEditSave={false}
      breadcrumbs={[
        { label: "Settings", view: "settings" },
        { label: "Backup & Restore", view: "backup" },
      ]}
      onNavigate={onNavigate}
      noContainer={true}
    >
      <div className="settings-flex-column" style={{ gap: "2rem" }}>
        {/* Backup Pharmacy Database Card */}
        <div className="admin-card" style={{ marginBottom: 0 }}>
          <div className="mb-4">
            <h6 className="settings-section-title" style={{ fontSize: "1.1rem" }}>
              Pharmacy Tenant Data Backup
            </h6>
            <p className="settings-section-helper mb-0">
              Create a secure database dump containing products, sales, inventory batches, and order history for this pharmacy branch.
            </p>
          </div>

          <div className="row g-4 align-items-center">
            <div className="col-12 col-md-7 col-lg-8">
              <div
                style={{
                  border: "1px solid #b8e0f2",
                  borderRadius: "10px",
                  padding: "1.5rem",
                  backgroundColor: "#f6fbfe",
                }}
              >
                <p className="settings-section-helper mb-1" style={{ fontSize: "0.85rem" }}>
                  Last Recorded Pharmacy Backup
                </p>
                <h4 style={{ color: "#2aabe2", fontWeight: "700", marginBottom: "1rem", fontSize: "1.25rem" }}>
                  {lastBackup.timestamp}
                </h4>

                <div className="d-flex mb-3 gap-4">
                  <div>
                    <p className="settings-section-helper mb-1" style={{ fontSize: "0.8rem" }}>
                      Backup File Size
                    </p>
                    <p style={{ fontWeight: "600", color: "#444", margin: 0, fontSize: "0.9rem" }}>
                      {lastBackup.size}
                    </p>
                  </div>
                  <div>
                    <p className="settings-section-helper mb-1" style={{ fontSize: "0.8rem" }}>
                      Storage Location
                    </p>
                    <p style={{ fontWeight: "600", color: "#444", margin: 0, fontSize: "0.9rem" }}>
                      {lastBackup.location}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-5 col-lg-4 text-md-end">
              <button
                className="btn btn-primary d-inline-flex align-items-center gap-2 px-4 py-3 rounded-3 shadow-sm"
                onClick={handleBackupNow}
                disabled={isBackingUp}
                style={{ backgroundColor: "#2aabe2", borderColor: "#2aabe2" }}
              >
                <img src={backupNowIcon} alt="Backup" style={{ width: "20px", height: "20px" }} />
                {isBackingUp ? "Creating Snapshot..." : "Backup Pharmacy Data Now"}
              </button>
            </div>
          </div>
        </div>

        {/* Restore System Card */}
        <div className="admin-card" style={{ marginBottom: 0 }}>
          <div className="mb-4">
            <h6 className="settings-section-title" style={{ fontSize: "1.1rem" }}>
              Restore Pharmacy Tenant Data
            </h6>
            <p className="settings-section-helper mb-0">
              Restore your store data using a previously exported pharmacy backup file.
            </p>
          </div>

          <div
            style={{
              backgroundColor: "#fffdf0",
              border: "1px solid #fbe69b",
              borderRadius: "8px",
              padding: "1rem 1.5rem",
              display: "flex",
              alignItems: "flex-start",
              gap: "1rem",
              marginBottom: "2rem",
            }}
          >
            <img src={warningIcon} alt="Warning" style={{ width: "24px", height: "24px", marginTop: "2px" }} />
            <div>
              <h6 style={{ fontSize: "0.95rem", fontWeight: "600", color: "#666", marginBottom: "0.25rem" }}>
                Multi-Tenant Data Warning
              </h6>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "#777" }}>
                This restore operation will safely replace inventory, sales, and catalog data for this specific pharmacy branch. Ensure you upload a valid pharmacy backup file.
              </p>
            </div>
          </div>

          <div className="row g-4">
            {/* Left Column: Select Backup File */}
            <div className="col-12 col-md-6">
              <h6 className="settings-section-title" style={{ fontSize: "1rem", marginBottom: "1rem" }}>
                Select Pharmacy Backup File
              </h6>
              <div
                style={{
                  border: "1px dashed #2aabe2",
                  borderRadius: "10px",
                  padding: "2rem 1.5rem",
                  backgroundColor: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "1.5rem",
                  cursor: "pointer",
                  minHeight: "150px",
                }}
                onClick={triggerFileInput}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  accept=".sql,.json,.gz"
                  onChange={handleFileChange}
                />
                <img src={selectBackupIcon} alt="Upload" style={{ width: "44px", height: "44px" }} />
                <div className="d-flex align-items-center gap-3">
                  <div>
                    <p style={{ fontSize: "0.95rem", fontWeight: "500", color: "#444", margin: 0 }}>
                      {restoreFile ? restoreFile.name : "Drag and drop your pharmacy snapshot here."}
                    </p>
                    <p className="settings-section-helper mb-0" style={{ fontSize: "0.75rem" }}>
                      Supported formats: .sql, .json   Max size: 500 MB
                    </p>
                  </div>
                  {!restoreFile && (
                    <>
                      <span style={{ fontSize: "0.9rem", color: "#999" }}>or</span>
                      <button
                        className="btn btn-outline-primary btn-sm px-3 rounded-pill"
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

            {/* Right Column: Restore Confirmation & Info */}
            <div className="col-12 col-md-6">
              <h6 className="settings-section-title" style={{ fontSize: "1rem", marginBottom: "1rem" }}>
                Restore Verification Checklist
              </h6>

              <div
                style={{
                  border: "1px solid #b8e0f2",
                  borderRadius: "10px",
                  padding: "1.25rem",
                  backgroundColor: "#f6fbfe",
                  marginBottom: "1rem",
                }}
              >
                <div className="d-flex align-items-start gap-3 mb-3">
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      border: "2px solid #2aabe2",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginTop: "2px",
                    }}
                  >
                    <span style={{ color: "#2aabe2", fontSize: "12px", fontWeight: "bold" }}>✓</span>
                  </div>
                  <div>
                    <h6 style={{ fontSize: "0.9rem", fontWeight: "600", color: "#555", marginBottom: "0.1rem" }}>
                      Pharmacy ID Matching
                    </h6>
                    <p style={{ margin: 0, fontSize: "0.8rem", color: "#888" }}>
                      File will be validated against this pharmacy's tenant ID before applying.
                    </p>
                  </div>
                </div>
                <div className="d-flex align-items-start gap-3 mb-3">
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      border: "2px solid #2aabe2",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginTop: "2px",
                    }}
                  >
                    <span style={{ color: "#2aabe2", fontSize: "12px", fontWeight: "bold" }}>✓</span>
                  </div>
                  <div>
                    <h6 style={{ fontSize: "0.9rem", fontWeight: "600", color: "#555", marginBottom: "0.1rem" }}>
                      Branch Data Overwrite Notice
                    </h6>
                    <p style={{ margin: 0, fontSize: "0.8rem", color: "#888" }}>
                      Current branch products, batches, and order states will be replaced by the snapshot.
                    </p>
                  </div>
                </div>
              </div>

              <button
                className="btn btn-danger w-100 py-2 d-flex align-items-center justify-content-center gap-2 rounded-3"
                style={{ backgroundColor: "#ff4d4f", borderColor: "#ff4d4f", fontWeight: "600" }}
                disabled={!restoreFile}
              >
                <img src={restoreIcon} alt="Restore" style={{ width: "20px", height: "20px" }} />
                Restore Pharmacy Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </SettingForm>
  );
};

export default BackupAndRestore;
