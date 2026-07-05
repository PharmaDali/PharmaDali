import { useState, useEffect } from "react";
import { getAdminProfile, updateAdminProfile, updateAdminPharmacy } from "../services/profileService";
import "../assets/css/profile.css";
import emailIcon from "../assets/icons/profile/email.svg";
import phoneIcon from "../assets/icons/profile/phone-number.svg";
import adminIdIcon from "../assets/icons/profile/admin-id.svg";
import memberSinceIcon from "../assets/icons/profile/member-since.svg";
import pharmacyNameIcon from "../assets/icons/profile/pharmacy-name.svg";
import locationIcon from "../assets/icons/profile/location.svg";
import pharmacyIdIcon from "../assets/icons/profile/pharmacy-id.svg";
import dateRegisteredIcon from "../assets/icons/profile/date-registered.svg";
import editIcon from "../assets/icons/profile/edit.svg";

const getInitials = (firstName = "", lastName = "") => {
  const f = (firstName.trim()[0] || "").toUpperCase();
  const l = (lastName.trim()[0] || "").toUpperCase();
  return `${f}${l}`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Sub-components

function InfoField({ icon, label, value }) {
  return (
    <div className="profile-info-field h-100 rounded-3 border p-3">
      <div className="d-flex align-items-center gap-1 mb-1">
        <img src={icon} alt="" className="profile-field-icon flex-shrink-0" />
        <span className="profile-field-label fw-medium lh-1">{label}</span>
      </div>
      <div className="profile-field-value fw-semibold mt-1 ps-3">{value}</div>
    </div>
  );
}

function EditableInfoField({ icon, label, value, isEditing, editValue, onEdit, onCancel, onSave, onChange, saving }) {
  return (
    <div className="profile-info-field h-100 rounded-3 border p-3">
      <div className="d-flex align-items-center gap-1 mb-1">
        <img src={icon} alt="" className="profile-field-icon flex-shrink-0" />
        <span className="profile-field-label fw-medium lh-1">{label}</span>
        {!isEditing && (
          <button
            className="btn btn-link p-0 ms-auto profile-edit-btn"
            onClick={onEdit}
            title={`Edit ${label}`}
          >
            <img src={editIcon} alt={`Edit ${label}`} className="fs-6" />
          </button>
        )}
      </div>
      {isEditing ? (
        <div className="d-flex align-items-center gap-1 mt-1">
          <input
            className="form-control form-control-sm"
            value={editValue}
            onChange={(e) => onChange(e.target.value)}
            autoFocus
          />
          <button
            className=" save-btn btn btn-sm px-2"
            onClick={onSave}
            disabled={saving}
            title="Save"
          >
            {saving
              ? <span className="spinner-border spinner-border-sm" role="status" />
              : <i className="bi bi-check2" />}
          </button>
          <button
            className="btn btn-sm btn-outline-secondary px-2"
            onClick={onCancel}
            disabled={saving}
            title="Cancel"
          >
            <i className="bi bi-x fs-6" />
          </button>
        </div>
      ) : (
        <div className="profile-field-value fw-semibold mt-1 ps-3">{value}</div>
      )}
    </div>
  );
}

// Main component

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editField, setEditField] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [nameEditing, setNameEditing] = useState(false);
  const [firstNameEdit, setFirstNameEdit] = useState("");
  const [lastNameEdit, setLastNameEdit] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    getAdminProfile()
      .then(setUser)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleEdit = (field, currentValue) => {
    setSaveError(null);
    setEditField(field);
    setEditValue(currentValue === "—" ? "" : currentValue || "");
  };

  const handleCancel = () => {
    setEditField(null);
    setEditValue("");
    setNameEditing(false);
    setSaveError(null);
  };

  const handleNameEdit = () => {
    setSaveError(null);
    setFirstNameEdit(user?.first_name || "");
    setLastNameEdit(user?.last_name || "");
    setNameEditing(true);
  };

  const handleNameSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      await updateAdminProfile({ first_name: firstNameEdit, last_name: lastNameEdit });
      setUser((prev) => ({ ...prev, first_name: firstNameEdit, last_name: lastNameEdit }));
      setNameEditing(false);
    } catch {
      setSaveError("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      if (editField === "phone") {
        await updateAdminProfile({ mobile_number: editValue });
        setUser((prev) => ({ ...prev, mobile_number: editValue }));
      } else {
        const payload =
          editField === "pharmacyName"
            ? { pharmacy_name: editValue }
            : { location: editValue };
        await updateAdminPharmacy(payload);
        setUser((prev) => ({
          ...prev,
          pharmacy: {
            ...prev?.pharmacy,
            ...(editField === "pharmacyName"
              ? { pharmacy_name: editValue }
              : { location: editValue }),
          },
        }));
      }
      setEditField(null);
    } catch {
      setSaveError("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading…</span>
        </div>
      </div>
    );
  }

  const initials = getInitials(user?.first_name, user?.last_name);
  const fullName = user ? `${user.first_name} ${user.last_name}` : "Admin";
  const pharmacyName = user?.pharmacy?.pharmacy_name || "—";
  const location = user?.pharmacy?.location || "—";
  const pharmacyId = user?.pharmacy?.id ?? user?.pharmacy_id ?? "—";
  const memberSince = formatDate(user?.created_at);
  const dateRegistered = formatDate(user?.pharmacy?.created_at);

  return (
    <div>
      {/* Page header */}
      <div className="admin-page-header">
        <h4 className="admin-page-title fw-semibold mb-0">My Profile</h4>
        <p className="admin-page-subtitle">View and manage your account information.</p>
      </div>

      {saveError && (
        <div className="alert alert-danger alert-dismissible fade show mb-3" role="alert">
          {saveError}
          <button type="button" className="btn-close" onClick={() => setSaveError(null)} />
        </div>
      )}

      <div className="card border-0 shadow-sm profile-card">
        <div className="card-body p-4 p-lg-5">
          <div className="row g-4 align-items-start">

            {/* ── Avatar column ── */}
            <div className="col-12 col-md-auto d-flex flex-column align-items-center profile-avatar-col p-5">
              <div className="profile-initials-avatar d-flex align-items-center justify-content-center rounded-circle border border-3 flex-shrink-0 p-4">
                <span className="profile-initials-text fw-bold lh-1">{initials}</span>
              </div>

              {nameEditing ? (
                <div className="mt-3 w-100">
                  <label className="form-label small fw-medium text-muted mb-1">First Name</label>
                  <input
                    className="form-control form-control-sm mb-2 text-center"
                    placeholder="First name"
                    value={firstNameEdit}
                    onChange={(e) => setFirstNameEdit(e.target.value)}
                    autoFocus
                  />
                  <label className="form-label small fw-medium text-muted mb-1">Last Name</label>
                  <input
                    className="form-control form-control-sm mb-2 text-center"
                    placeholder="Last name"
                    value={lastNameEdit}
                    onChange={(e) => setLastNameEdit(e.target.value)}
                  />
                  <div className="d-flex gap-2 justify-content-center">
                    <button className="save-btn btn btn-sm px-3" onClick={handleNameSave} disabled={saving}>
                      {saving
                        ? <span className="spinner-border spinner-border-sm" role="status" />
                        : <i className="bi bi-check2" />}
                    </button>
                    <button className="btn btn-sm btn-outline-secondary px-3" onClick={handleCancel} disabled={saving}>
                      <i className="bi bi-x" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="d-flex align-items-center gap-1 mt-3 mb-1">
                    <h5 className="fw-semibold m-0 text-center" style={{ color: "var(--pd-text-dark)" }}>
                      {fullName}
                    </h5>
                    <button className="btn btn-link p-0 ms-1 profile-edit-btn" onClick={handleNameEdit} title="Edit name">
                      <img src={editIcon} alt="Edit name" style={{ width: 20, height: 20 }} />
                    </button>
                  </div>
                  <span className="badge profile-role-badge rounded-pill text-uppercase py-1 px-3">Administrator</span>
                </>
              )}
            </div>

            {/* ── Vertical divider (desktop only) ── */}
            <div className="col-auto d-none d-md-flex align-items-stretch px-0">
              <div className="profile-vr" />
            </div>

            {/* ── Account Information ── */}
            <div className="col-12 col-md">
              <h6 className="profile-section-title d-flex align-items-center gap-2 fw-semibold fs-4 pb-2 mb-3">
                Account Information
              </h6>
              <div className="row g-3">
                <div className="col-12">
                  <InfoField
                    icon={emailIcon}
                    label="Email Address"
                    value={user?.email || "—"}
                  />
                </div>
                <div className="col-12">
                  <EditableInfoField
                    icon={phoneIcon}
                    label="Phone Number"
                    value={user?.mobile_number || "—"}
                    isEditing={editField === "phone"}
                    editValue={editValue}
                    onEdit={() => handleEdit("phone", user?.mobile_number)}
                    onCancel={handleCancel}
                    onSave={handleSave}
                    onChange={setEditValue}
                    saving={saving}
                  />
                </div>
                <div className="col-12">
                  <InfoField icon={adminIdIcon} label="Admin ID" value={user?.id ?? "—"} />
                </div>
                <div className="col-12">
                  <InfoField icon={memberSinceIcon} label="Member since" value={memberSince} />
                </div>
              </div>
            </div>

            {/* ── Vertical divider (desktop only) ── */}
            <div className="col-auto d-none d-md-flex align-items-stretch px-0">
              <div className="profile-vr" />
            </div>

            {/* ── Pharmacy Information ── */}
            <div className="col-12 col-md">
              <h6 className="profile-section-title d-flex align-items-center gap-2 fw-semibold fs-4 pb-2 mb-3">
                Pharmacy Information
              </h6>
              <div className="row g-3">
                <div className="col-12">
                  <EditableInfoField
                    icon={pharmacyNameIcon}
                    label="Pharmacy Name"
                    value={pharmacyName}
                    isEditing={editField === "pharmacyName"}
                    editValue={editValue}
                    onEdit={() => handleEdit("pharmacyName", pharmacyName)}
                    onCancel={handleCancel}
                    onSave={handleSave}
                    onChange={setEditValue}
                    saving={saving}
                  />
                </div>
                <div className="col-12">
                  <EditableInfoField
                    icon={locationIcon}
                    label="Location"
                    value={location}
                    isEditing={editField === "location"}
                    editValue={editValue}
                    onEdit={() => handleEdit("location", location)}
                    onCancel={handleCancel}
                    onSave={handleSave}
                    onChange={setEditValue}
                    saving={saving}
                  />
                </div>
                <div className="col-12">
                  <InfoField icon={pharmacyIdIcon} label="Pharmacy ID" value={pharmacyId} />
                </div>
                <div className="col-12">
                  <InfoField icon={dateRegisteredIcon} label="Date Registered" value={dateRegistered} />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
