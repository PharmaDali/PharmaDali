import { useEffect, useMemo, useRef, useState } from "react";
import { SettingForm } from "./SettingForm";
import Modal from "../../shared/components/Modal";
import { PageLoader } from "../../shared/components/loading";
import infoIcon from "../../assets/icons/modal-icons/info.svg";
import {
  getPharmacySettings,
  updatePharmacySettings,
  uploadPaymentQrCode,
  deletePaymentQrCode,
} from "../../services/pharmacySettingsService";

export const PaymentSettings = ({ onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [selectedQrFile, setSelectedQrFile] = useState(null);
  const [shouldRemoveQr, setShouldRemoveQr] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [formData, setFormData] = useState({
    enable_online_payment: false,
    gcash_name: "",
    gcash_number: "",
  });

  const [savedData, setSavedData] = useState({ ...formData });
  const [qrPreview, setQrPreview] = useState(null);
  const [savedQrPreview, setSavedQrPreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const res = await getPharmacySettings();
      const pharmacy = res.data?.pharmacy || {};
      const paymentSettings = res.data?.payment_settings || {};

      const gcashName = paymentSettings.gcash_name || pharmacy.gcash_name || "";
      const gcashNumber = paymentSettings.gcash_number || pharmacy.gcash_number || "";
      const qrUrl = paymentSettings.payment_qr_code_url || pharmacy.payment_qr_code_url || null;

      const hasCompleteInfo = Boolean(qrUrl && gcashName.trim() !== "" && gcashNumber.trim() !== "");
      const rawEnabled =
        paymentSettings.enable_online_payment !== undefined
          ? paymentSettings.enable_online_payment
          : pharmacy.enable_online_payment;

      const loadedData = {
        enable_online_payment: hasCompleteInfo ? Boolean(rawEnabled ?? true) : false,
        gcash_name: gcashName,
        gcash_number: gcashNumber,
      };

      setFormData(loadedData);
      setSavedData(loadedData);
      setQrPreview(qrUrl);
      setSavedQrPreview(qrUrl);
      setSelectedQrFile(null);
      setShouldRemoveQr(false);
      setFormErrors({});
    } catch (err) {
      setErrorMessage(err.message || "Failed to load payment settings.");
    } finally {
      setLoading(false);
    }
  };

  // Online payment info is considered complete only when all 3 fields are non-empty
  const hasCompletePaymentInfo = useMemo(() => {
    return Boolean(
      qrPreview &&
      !shouldRemoveQr &&
      formData.gcash_name &&
      formData.gcash_name.trim() !== "" &&
      formData.gcash_number &&
      formData.gcash_number.trim() !== ""
    );
  }, [qrPreview, shouldRemoveQr, formData.gcash_name, formData.gcash_number]);

  const effectiveEnabled = hasCompletePaymentInfo ? Boolean(formData.enable_online_payment) : false;

  // Detect whether any value has been altered from the saved state
  const isDirty = useMemo(() => {
    const textOrToggleChanged =
      effectiveEnabled !== Boolean(savedData.enable_online_payment) ||
      formData.gcash_name !== savedData.gcash_name ||
      formData.gcash_number !== savedData.gcash_number;
    const qrChanged = selectedQrFile !== null || shouldRemoveQr;
    return textOrToggleChanged || qrChanged;
  }, [effectiveEnabled, formData, savedData, selectedQrFile, shouldRemoveQr]);

  const validateForm = () => {
    const errors = {};

    // 1. Validate QR Code (Required)
    if (!qrPreview || shouldRemoveQr) {
      errors.payment_qr = "GCash payment QR code image is required.";
    }

    // 2. Validate Account Name (Required)
    const trimmedName = (formData.gcash_name || "").trim();
    if (!trimmedName) {
      errors.gcash_name = "GCash account name is required.";
    } else if (trimmedName.length > 100) {
      errors.gcash_name = "Account name must not exceed 100 characters.";
    } else if (!/^[a-zA-Z0-9\s.\-&'()]+$/.test(trimmedName)) {
      errors.gcash_name = "Account name contains invalid characters.";
    }

    // 3. Validate Mobile / Merchant Number (Required)
    const trimmedNumber = (formData.gcash_number || "").trim();
    if (!trimmedNumber) {
      errors.gcash_number = "GCash mobile or merchant number is required.";
    } else {
      const cleaned = trimmedNumber.replace(/[\s\-]/g, "");
      if (!/^(\+639|09)\d{9}$/.test(cleaned)) {
        errors.gcash_number = "Enter a valid 11-digit mobile number starting with 09 (e.g. 09171234567).";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };

      if (field === "gcash_name" || field === "gcash_number") {
        const nextHasQr = Boolean(qrPreview && !shouldRemoveQr);
        const nextHasName = (next.gcash_name || "").trim() !== "";
        const nextHasNumber = (next.gcash_number || "").trim() !== "";
        const nextComplete = nextHasQr && nextHasName && nextHasNumber;

        if (!nextComplete) {
          next.enable_online_payment = false;
        } else if (!hasCompletePaymentInfo && nextComplete) {
          next.enable_online_payment = true;
        }
      }

      return next;
    });

    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }
    setShowConfirmModal(true);
  };

  const executeSave = async () => {
    setShowConfirmModal(false);
    try {
      setSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      let updatedQrUrl = savedQrPreview;

      // Upload new QR file privately first so backend sees payment_qr_code_path when saving settings
      if (selectedQrFile) {
        const res = await uploadPaymentQrCode(selectedQrFile);
        if (res.payment_qr_code_url) {
          updatedQrUrl = res.payment_qr_code_url;
          setQrPreview(res.payment_qr_code_url);
          setSavedQrPreview(res.payment_qr_code_url);
        }
        setSelectedQrFile(null);
        setShouldRemoveQr(false);
      } else if (shouldRemoveQr) {
        await deletePaymentQrCode();
        updatedQrUrl = null;
        setQrPreview(null);
        setSavedQrPreview(null);
        setSelectedQrFile(null);
        setShouldRemoveQr(false);
      }

      const finalEnabled = Boolean(
        updatedQrUrl &&
        formData.gcash_name.trim() !== "" &&
        formData.gcash_number.trim() !== "" &&
        effectiveEnabled
      );

      // Update text fields and online payment toggle
      await updatePharmacySettings({
        enable_online_payment: finalEnabled,
        gcash_name: formData.gcash_name.trim(),
        gcash_number: formData.gcash_number.trim(),
      });

      const nextSaved = {
        enable_online_payment: finalEnabled,
        gcash_name: formData.gcash_name.trim(),
        gcash_number: formData.gcash_number.trim(),
      };

      setFormData(nextSaved);
      setSavedData(nextSaved);
      setFormErrors({});
      setSuccessMessage("Payment settings updated successfully.");
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      setErrorMessage(err.message || "Failed to save payment settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(savedData);
    setQrPreview(savedQrPreview);
    setSelectedQrFile(null);
    setShouldRemoveQr(false);
    setErrorMessage("");
    setFormErrors({});
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleQrPick = () => {
    fileInputRef.current?.click();
  };

  const handleQrChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file (JPEG, PNG, or WebP).");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage("The QR code image size must be less than 2MB.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setQrPreview(previewUrl);
    setSelectedQrFile(file);
    setShouldRemoveQr(false);
    setErrorMessage("");
    setFormErrors((prev) => ({ ...prev, payment_qr: undefined }));

    setFormData((prev) => {
      const hasName = (prev.gcash_name || "").trim() !== "";
      const hasNumber = (prev.gcash_number || "").trim() !== "";
      if (!hasCompletePaymentInfo && hasName && hasNumber) {
        return { ...prev, enable_online_payment: true };
      }
      return prev;
    });
  };

  const handleRemoveQr = () => {
    setQrPreview(null);
    setSelectedQrFile(null);
    setShouldRemoveQr(true);
    setFormData((prev) => ({ ...prev, enable_online_payment: false }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Header actions appear dynamically only when something has been altered
  const headerActions = isDirty ? (
    <div className="d-flex align-items-center gap-2">
      <button
        type="button"
        className="btn btn-outline-secondary btn-sm px-3 rounded-2 fw-medium"
        onClick={handleCancel}
        disabled={saving}
      >
        Cancel
      </button>
      <button
        type="button"
        className="btn btn-sm px-3 rounded-2 text-white fw-semibold shadow-sm d-flex align-items-center gap-1.5"
        style={{
          backgroundColor: "var(--pd-primary, #2aabe2)",
          border: "none",
        }}
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? (
          <>
            <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
            Saving...
          </>
        ) : (
          <>
            <i className="fa-solid fa-check me-1"></i>
            Save Changes
          </>
        )}
      </button>
    </div>
  ) : null;

  const sections = [
    {
      key: "enable_online_payment",
      label: "Online Payment (GCash)",
      helper: "Allow customers to pay online via GCash QR code during order checkout. Automatically disabled when any payment field below is empty.",
      content: (
        <div className="d-flex flex-column gap-2 w-100">
          <div className="d-flex align-items-center gap-3">
            <div className="form-check form-switch m-0" style={{ fontSize: "16px" }}>
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                id="enable_online_payment"
                checked={effectiveEnabled}
                onChange={(e) => handleInputChange("enable_online_payment", e.target.checked)}
                disabled={saving || !hasCompletePaymentInfo}
                style={{ cursor: !saving && hasCompletePaymentInfo ? "pointer" : "not-allowed" }}
              />
              <label
                className="form-check-label small fw-semibold ms-2"
                htmlFor="enable_online_payment"
                style={{
                  cursor: !saving && hasCompletePaymentInfo ? "pointer" : "default",
                  color: effectiveEnabled ? "#16a34a" : "#64748b",
                }}
              >
                {effectiveEnabled ? "Enabled" : "Disabled"}
              </label>
            </div>

            <span
              className={`badge ${
                effectiveEnabled ? "bg-success-subtle text-success" : "bg-secondary-subtle text-secondary"
              } px-2.5 py-1.5 rounded-pill`}
              style={{ fontSize: "0.72rem", fontWeight: 600 }}
            >
              <i
                className={`fa-solid ${
                  effectiveEnabled ? "fa-circle-check" : "fa-circle-xmark"
                } me-1`}
              ></i>
              {effectiveEnabled ? "Accepting Online Payments" : "Cash Only at Pharmacy"}
            </span>
          </div>

          {!hasCompletePaymentInfo && (
            <small className="text-muted d-flex align-items-center gap-1.5" style={{ fontSize: "0.75rem" }}>
              <i className="fa-solid fa-circle-info text-warning"></i>
              <span>
                Online payment is disabled because payment details are incomplete. Fill in all required fields below to enable.
              </span>
            </small>
          )}
        </div>
      ),
    },
    {
      key: "payment_qr",
      label: (
        <>
          GCash Payment QR Code <span className="text-danger">*</span>
        </>
      ),
      helper: "Official QR code image presented to customers during checkout and online order payment. Required.",
      content: (
        <div className="d-flex flex-column gap-2 w-100">
          <div className="d-flex align-items-center gap-3">
            <div
              className="d-flex align-items-center justify-center p-2 rounded-3 bg-white"
              style={{
                width: "160px",
                height: "160px",
                border: formErrors.payment_qr ? "1.5px dashed #dc3545" : "1.5px dashed #cbd5e1",
                backgroundColor: formErrors.payment_qr ? "#fff5f5" : "#f8fafc",
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              {qrPreview ? (
                <img
                  src={qrPreview}
                  alt="Payment QR Code"
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              ) : (
                <div className="text-center text-muted p-2">
                  <i className="fa-solid fa-qrcode fa-2x mb-2 text-secondary opacity-50"></i>
                  <div className="small" style={{ fontSize: "0.75rem" }}>
                    No QR Code Uploaded
                  </div>
                </div>
              )}
            </div>

            <div className="d-flex flex-column gap-2" style={{ maxWidth: "240px" }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="d-none"
                onChange={handleQrChange}
              />

              <div className="d-flex flex-column gap-2">
                <button
                  type="button"
                  className="btn btn-sm rounded-3 d-flex align-items-center justify-content-center gap-2 px-3 py-2 text-white fw-semibold"
                  style={{
                    backgroundColor: "var(--pd-primary, #2aabe2)",
                    border: "none",
                    minWidth: "160px",
                    transition: "background-color 0.2s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "var(--pd-primary-dark, #48aad9)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "var(--pd-primary, #2aabe2)")
                  }
                  onClick={handleQrPick}
                  disabled={saving}
                >
                  <i className="fa-solid fa-upload"></i>
                  <span className="text-center">{qrPreview ? "Change QR Code" : "Upload QR Code"}</span>
                </button>

                {qrPreview && (
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm rounded-3 d-flex align-items-center justify-content-center gap-2 px-3 py-2 fw-semibold"
                    style={{ minWidth: "160px" }}
                    onClick={handleRemoveQr}
                    disabled={saving}
                  >
                    <i className="fa-solid fa-trash-can"></i>
                    <span className="text-center">Remove QR Code</span>
                  </button>
                )}
              </div>

              <div>
                <span
                  className={`badge ${
                    qrPreview ? "bg-success-subtle text-success" : "bg-secondary-subtle text-secondary"
                  } px-2.5 py-1.5 rounded-pill`}
                  style={{ fontSize: "0.75rem", fontWeight: 600 }}
                >
                  <i
                    className={`fa-solid ${
                      qrPreview ? "fa-circle-check" : "fa-circle-info"
                    } me-1.5`}
                  ></i>
                  {qrPreview ? "Active QR Uploaded" : "No QR Uploaded"}
                </span>
              </div>

              <small className="text-muted" style={{ fontSize: "0.75rem", lineHeight: "1.3" }}>
                Accepted: JPG, PNG, or WebP (Max 2MB). Stored privately on server and streamed securely.
              </small>
            </div>
          </div>

          {formErrors.payment_qr && (
            <div className="text-danger small mt-1" style={{ fontSize: "0.8rem" }}>
              {formErrors.payment_qr}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "gcash_name",
      label: (
        <>
          GCash Account Name <span className="text-danger">*</span>
        </>
      ),
      helper: "Official name on the GCash account displayed to customers for verification. Required.",
      content: (
        <div>
          <input
            type="text"
            className={`form-control settings-form-input ${formErrors.gcash_name ? "is-invalid border-danger" : ""}`}
            placeholder="Enter Account name"
            value={formData.gcash_name}
            onChange={(e) => handleInputChange("gcash_name", e.target.value)}
            disabled={saving}
            required
          />
          {formErrors.gcash_name && (
            <div className="text-danger small mt-1" style={{ fontSize: "0.8rem" }}>
              {formErrors.gcash_name}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "gcash_number",
      label: (
        <>
          GCash Mobile / Merchant Number <span className="text-danger">*</span>
        </>
      ),
      helper: "11-digit mobile number or merchant ID so customers can manually verify or transfer. Required.",
      content: (
        <div>
          <input
            type="tel"
            className={`form-control settings-form-input ${formErrors.gcash_number ? "is-invalid border-danger" : ""}`}
            placeholder="Enter mobile number (e.g. 09171234567)"
            value={formData.gcash_number}
            onChange={(e) => handleInputChange("gcash_number", e.target.value)}
            disabled={saving}
            required
          />
          {formErrors.gcash_number && (
            <div className="text-danger small mt-1" style={{ fontSize: "0.8rem" }}>
              {formErrors.gcash_number}
            </div>
          )}
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <SettingForm
        title="Payment Settings"
        description="GCash QR code, merchant account details, and online payment methods."
        showEditSave={false}
        breadcrumbs={[
          { label: "Settings", view: "settings" },
          { label: "Payment Settings", view: "payment" },
        ]}
        onNavigate={onNavigate}
      >
        <PageLoader
          title="Loading payment settings..."
          subtitle="Please wait a moment while we fetch your pharmacy payment configuration."
          iconClass="fa-solid fa-qrcode"
          minHeight={200}
        />
      </SettingForm>
    );
  }

  return (
    <>
      <SettingForm
        title="Payment Settings"
        description="GCash QR code, merchant account details, and online payment methods."
        showEditSave={false}
        actions={headerActions}
        breadcrumbs={[
          { label: "Settings", view: "settings" },
          { label: "Payment Settings", view: "payment" },
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

      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Payment Settings"
        size="sm"
        showCloseButton={true}
        className="settings-confirm-modal"
        footer={
          <div className="d-flex gap-2 w-100">
            <button
              type="button"
              className="btn btn-light flex-grow-1 rounded-3 text-secondary fw-semibold"
              style={{ border: "1px solid #cbd5e1" }}
              onClick={() => setShowConfirmModal(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn flex-grow-1 rounded-3 text-white fw-semibold"
              style={{ backgroundColor: "var(--pd-primary, #2aabe2)", border: "none" }}
              onClick={executeSave}
            >
              Confirm Save
            </button>
          </div>
        }
      >
        <div className="text-center py-2">
          <div className="mb-2">
            <img src={infoIcon} alt="Info" style={{ width: "52px", height: "52px" }} />
          </div>
          <p className="mb-0 text-muted small px-1">
            Are you sure you want to update the payment QR code and merchant details for this pharmacy?
          </p>
        </div>
      </Modal>
    </>
  );
};
