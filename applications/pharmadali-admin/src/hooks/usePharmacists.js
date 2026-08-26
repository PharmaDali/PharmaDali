import { useState, useEffect, useMemo, useRef } from "react";
import {
  fetchPharmacists,
  createPharmacist,
  updatePharmacist,
  deletePharmacist,
} from "../services/pharmacistService";

export const calculateAge = (birthdate) => {
  if (!birthdate) return null;
  const today = new Date();
  const birth = new Date(birthdate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

export const getAvatarColor = (birthdate) => {
  const age = calculateAge(birthdate);
  if (!age || age < 25) return "#3b82f6";
  if (age < 30) return "#8b5cf6";
  if (age < 35) return "#ec4899";
  return "#f59e0b";
};

export const getAvatarInitials = (name) => {
  if (!name) return "P";
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

export function usePharmacists() {
  const [pharmacists, setPharmacists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [viewingPharmacist, setViewingPharmacist] = useState(null);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [permissionsPharmacist, setPermissionsPharmacist] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    birthdate: "",
    status: "Active",
    licenseNumber: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [tableError, setTableError] = useState(null);
  const lastSubmitRef = useRef(0);

  const loadPharmacists = async () => {
    try {
      setLoading(true);
      setTableError(null);
      const response = await fetchPharmacists();
      setPharmacists(response);
    } catch (error) {
      console.error("Failed to load pharmacists:", error);
      const isTimeout =
        error.code === "ECONNABORTED" ||
        error.code === "ETIMEDOUT" ||
        error.message?.toLowerCase().includes("timeout") ||
        error.message?.toLowerCase().includes("network error");
      setTableError(
        isTimeout
          ? "Server request timed out. Please check your connection and refresh."
          : (error.response?.data?.message || "Failed to load pharmacist list.")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPharmacists();
  }, []);

  const rows = useMemo(() => {
    const list = Array.isArray(pharmacists) ? pharmacists : (pharmacists?.data || []);
    const q = search.trim().toLowerCase();

    if (!q) {
      return list;
    }

    return list.filter((item) => {
      const fullName = `${item.first_name} ${item.last_name}`.toLowerCase();
      const empNumber = item.pharmacist?.employee_number?.toLowerCase() || "";
      return fullName.includes(q) || empNumber.includes(q) || (item.mobile_number || "").includes(q);
    });
  }, [search, pharmacists]);

  const handleOpenPermissionsModal = (pharmacist) => {
    setPermissionsPharmacist(pharmacist);
    setShowPermissionsModal(true);
  };

  const handlePermissionsUpdated = (updatedUser) => {
    setPharmacists((prev) =>
      prev.map((item) => (item.id === updatedUser.id ? { ...item, ...updatedUser } : item))
    );
  };

  const handleOpenModal = (pharmacist = null) => {
    setFieldErrors({});
    setFormError(null);
    if (pharmacist) {
      setFormData({
        firstName: pharmacist.first_name || "",
        lastName: pharmacist.last_name || "",
        email: pharmacist.email || "",
        mobile: pharmacist.mobile_number || "",
        birthdate: pharmacist.date_of_birth?.split("T")[0] || "",
        status: pharmacist.is_active ? "Active" : "Inactive",
        licenseNumber: pharmacist.pharmacist?.license_number || "",
      });
      setEditingId(pharmacist.id);
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        mobile: "",
        birthdate: "",
        status: "Active",
        licenseNumber: "",
      });
      setEditingId(null);
    }
    setShowModal(true);
  };

  const handleOpenDetailsModal = (pharmacist) => {
    setViewingPharmacist(pharmacist);
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setViewingPharmacist(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFieldErrors({});
    setFormError(null);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      mobile: "",
      birthdate: "",
      status: "Active",
      licenseNumber: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
    if (formError) {
      setFormError(null);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    setFieldErrors({});
    setFormError(null);

    const errors = {};
    if (!formData.firstName.trim()) errors.firstName = "First name is required.";
    if (!formData.lastName.trim()) errors.lastName = "Last name is required.";
    if (!formData.email.trim()) errors.email = "Email address is required.";
    if (!formData.mobile.trim()) errors.mobile = "Mobile number is required.";
    if (!formData.birthdate) errors.birthdate = "Date of birth is required.";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    const now = Date.now();
    if (now - lastSubmitRef.current < 2000) return;
    lastSubmitRef.current = now;

    try {
      setIsSaving(true);
      const payload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        mobile_number: formData.mobile,
        date_of_birth: formData.birthdate,
        is_active: formData.status === "Active",
        license_number: formData.licenseNumber || null,
      };

      if (editingId) {
        const updated = await updatePharmacist(editingId, payload);
        setPharmacists((prev) =>
          prev.map((item) => (item.id === editingId ? { ...item, ...updated } : item))
        );
      } else {
        const created = await createPharmacist(payload);
        setPharmacists((prev) => [created, ...prev]);
      }

      handleCloseModal();
    } catch (err) {
      console.error("Failed to save pharmacist:", err);
      if (err.response?.data?.errors) {
        setFieldErrors(err.response.data.errors);
      } else {
        setFormError(err.response?.data?.message || "Failed to save pharmacist record.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePharmacist = (id) => {
    setDeletingId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      setIsDeleting(true);
      await deletePharmacist(deletingId);
      setPharmacists((prev) => prev.filter((item) => item.id !== deletingId));
      setShowDeleteModal(false);
      setDeletingId(null);
    } catch (err) {
      console.error("Failed to delete pharmacist:", err);
      alert(err.response?.data?.message || "Failed to delete pharmacist.");
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    pharmacists,
    rows,
    loading,
    search,
    setSearch,
    showModal,
    setShowModal,
    showDetailsModal,
    setShowDetailsModal,
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
    loadPharmacists,
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
  };
}

export default usePharmacists;
