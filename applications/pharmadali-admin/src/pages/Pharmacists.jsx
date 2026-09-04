import React, { useState } from "react";
import { usePharmacists } from "../hooks/usePharmacists";
import PharmacistsTable from "../components/Pharmacists/PharmacistsTable";
import PharmacistFormModal from "../components/Pharmacists/PharmacistFormModal";
import PharmacistDetailsModal from "../components/Pharmacists/PharmacistDetailsModal";
import PharmacistPermissionsModal from "../components/Pharmacists/PharmacistPermissionsModal";
import PharmacistDeleteModal from "../components/Pharmacists/PharmacistDeleteModal";
import "../assets/css/pharmacists.css";

export function Pharmacists() {
  const [successMessage, setSuccessMessage] = useState("");

  const {
    rows,
    loading,
    search,
    setSearch,
    showModal,
    showDetailsModal,
    viewingPharmacist,
    showPermissionsModal,
    setShowPermissionsModal,
    permissionsPharmacist,
    showDeleteModal,
    setShowDeleteModal,
    isDeleting,
    formData,
    editingId,
    isSaving,
    fieldErrors,
    formError,
    tableError,
    handleOpenPermissionsModal,
    handlePermissionsUpdated,
    handleOpenModal,
    handleOpenDetailsModal,
    handleCloseDetailsModal,
    handleCloseModal,
    handleInputChange,
    handleSave,
    handleDeletePharmacist,
    confirmDelete,
  } = usePharmacists();

  const handlePermissionsSuccess = (updatedUser) => {
    handlePermissionsUpdated(updatedUser);
    setSuccessMessage("Permissions have been updated successfully.");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  return (
    <section className="dashboard-page pharmacists-page">
      <h4 className="fw-bold mb-1 admin-page-title">Pharmacist</h4>
      <p className="admin-page-subtitle mb-4">List of pharmacist accounts in the pharmacy.</p>

      {successMessage && (
        <div className="pharmacists-success-banner mb-3">
          <div className="d-flex align-items-center gap-2">
            <i className="fa-solid fa-circle-check"></i>
            <span>{successMessage}</span>
          </div>
          <button 
            type="button" 
            className="pharmacists-success-close"
            onClick={() => setSuccessMessage("")}
            aria-label="Dismiss"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      )}

      <div className="d-none d-md-flex justify-content-end mb-3">
        <button type="button" className="admin-btn-primary" onClick={() => handleOpenModal()}>
          + Add new pharmacist
        </button>
      </div>

      <PharmacistsTable
        rows={rows}
        loading={loading}
        tableError={tableError}
        search={search}
        setSearch={setSearch}
        onOpenModal={handleOpenModal}
        onOpenDetailsModal={handleOpenDetailsModal}
        onOpenPermissionsModal={handleOpenPermissionsModal}
        onDelete={handleDeletePharmacist}
      />

      <PharmacistFormModal
        isOpen={showModal}
        onClose={handleCloseModal}
        editingId={editingId}
        formData={formData}
        handleInputChange={handleInputChange}
        handleSave={handleSave}
        isSaving={isSaving}
        fieldErrors={fieldErrors}
        formError={formError}
      />

      <PharmacistDetailsModal
        isOpen={showDetailsModal}
        onClose={handleCloseDetailsModal}
        pharmacist={viewingPharmacist}
        onEdit={handleOpenModal}
        onDelete={handleDeletePharmacist}
      />

      <PharmacistPermissionsModal
        isOpen={showPermissionsModal}
        onClose={() => setShowPermissionsModal(false)}
        pharmacist={permissionsPharmacist}
        onSuccess={handlePermissionsSuccess}
      />

      <PharmacistDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
      />
    </section>
  );
}

export default Pharmacists;

