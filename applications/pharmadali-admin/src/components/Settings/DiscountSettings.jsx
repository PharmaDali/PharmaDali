import React, { useState, useEffect } from "react";
import { fetchDiscounts, createDiscount, updateDiscount, deleteDiscount } from "../../services/discountService";
import { Breadcrumb } from "./Breadcrumb";
import { ListSkeleton } from "../../shared/components/loading";
import Modal from "../../shared/components/Modal";
import ToastNotification from "../../shared/components/ToastNotification";

export function DiscountSettings({ onNavigate }) {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    percentage: "",
    requires_id_number: false,
    is_active: true,
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadDiscounts();
  }, []);

  const loadDiscounts = async () => {
    setLoading(true);
    try {
      const res = await fetchDiscounts(true);
      if (res?.data) {
        setDiscounts(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch discounts:", err);
      setToast({ type: "danger", title: "Error", message: "Failed to load discount policies." });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingDiscount(null);
    setFormData({
      name: "",
      percentage: "",
      requires_id_number: false,
      is_active: true,
      description: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (discount) => {
    setEditingDiscount(discount);
    setFormData({
      name: discount.name,
      percentage: discount.percentage,
      requires_id_number: discount.requires_id_number,
      is_active: discount.is_active,
      description: discount.description || "",
    });
    setIsModalOpen(true);
  };

  const handleToggleActive = async (discount) => {
    try {
      const updatedStatus = !discount.is_active;
      await updateDiscount(discount.id, { is_active: updatedStatus });
      setDiscounts((prev) =>
        prev.map((d) => (d.id === discount.id ? { ...d, is_active: updatedStatus } : d))
      );
      setToast({
        type: "success",
        title: "Success",
        message: `Discount policy ${updatedStatus ? "activated" : "deactivated"}.`,
      });
    } catch (err) {
      console.error("Failed to toggle status:", err);
      setToast({ type: "danger", title: "Error", message: "Failed to update discount status." });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this discount policy?")) return;
    try {
      await deleteDiscount(id);
      setDiscounts((prev) => prev.filter((d) => d.id !== id));
      setToast({ type: "success", title: "Success", message: "Discount policy deleted successfully." });
    } catch (err) {
      console.error("Failed to delete discount:", err);
      setToast({ type: "danger", title: "Error", message: "Failed to delete discount policy." });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.percentage === "") return;

    setIsSubmitting(true);
    try {
      if (editingDiscount) {
        const res = await updateDiscount(editingDiscount.id, formData);
        if (res?.data) {
          setDiscounts((prev) => prev.map((d) => (d.id === editingDiscount.id ? res.data : d)));
          setToast({ type: "success", title: "Success", message: "Discount policy updated successfully." });
        }
      } else {
        const res = await createDiscount(formData);
        if (res?.data) {
          setDiscounts((prev) => [...prev, res.data]);
          setToast({ type: "success", title: "Success", message: "Discount policy created successfully." });
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to save discount:", err);
      setToast({ type: "danger", title: "Error", message: "Failed to save discount policy." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="dashboard-page">
      {toast && <ToastNotification toast={toast} onClose={() => setToast(null)} />}
      <Breadcrumb
        crumbs={[
          { label: "Settings", view: "settings" },
          { label: "Discount Policy Management", view: "discount" },
        ]}
        onNavigate={onNavigate}
      />

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1 admin-page-title" style={{ color: "#444444" }}>
            Discount Policy Management
          </h4>
          <p className="text-muted small mb-0">
            Configure discount rates, auto-fill percentages, and optional ID requirements for POS sales.
          </p>
        </div>
        <button
          className="admin-btn-primary"
          onClick={handleOpenAddModal}
        >
          <i className="fa-solid fa-plus" />
          Add Discount Policy
        </button>
      </div>

      <div className="admin-card overflow-hidden p-0">
        <div className="p-0">
          {loading ? (
            <div className="p-3">
              <ListSkeleton count={4} />
            </div>
          ) : discounts.length === 0 ? (
            <div className="text-center py-5 text-muted">No discount policies configured.</div>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th className="px-4 py-3 border-0">Policy Name</th>
                    <th className="px-3 py-3 border-0 text-center">Code</th>
                    <th className="px-3 py-3 border-0 text-center">Rate (%)</th>
                    <th className="px-3 py-3 border-0 text-center">ID Requirement</th>
                    <th className="px-3 py-3 border-0 text-center">Status</th>
                    <th className="px-4 py-3 border-0 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {discounts.map((discount) => (
                    <tr key={discount.id}>
                      <td className="px-4 py-3">
                        <div className="fw-semibold" style={{ color: "#444444" }}>
                          {discount.name}
                        </div>
                        {discount.description && (
                          <div className="text-muted small" style={{ fontSize: "12px" }}>
                            {discount.description}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="badge bg-light text-secondary border px-2 py-1">
                          {discount.code || "---"}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center fw-bold" style={{ color: "#2aabe2" }}>
                        {discount.percentage}%
                      </td>
                      <td className="px-3 py-3 text-center text-secondary" style={{ fontSize: "13px" }}>
                        {discount.requires_id_number ? "Optional ID" : "None"}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <div className="form-check form-switch d-flex justify-content-center m-0">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            checked={discount.is_active}
                            onChange={() => handleToggleActive(discount)}
                            style={{ cursor: "pointer" }}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-end">
                        <div className="d-flex justify-content-end gap-2">
                          <button
                            className="btn btn-sm btn-outline-secondary rounded-2 px-2 py-1"
                            onClick={() => handleOpenEditModal(discount)}
                            title="Edit policy"
                          >
                            <i className="fa-solid fa-pen" style={{ fontSize: "12px" }} />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger rounded-2 px-2 py-1"
                            onClick={() => handleDelete(discount.id)}
                            title="Delete policy"
                          >
                            <i className="fa-solid fa-trash-can" style={{ fontSize: "12px" }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="md">
        <form onSubmit={handleSubmit} className="p-3">
          <h5 className="fw-bold mb-3" style={{ color: "#444444" }}>
            {editingDiscount ? "Edit Discount Policy" : "Add New Discount Policy"}
          </h5>

          <div className="mb-3">
            <label className="form-label fw-semibold small" style={{ color: "#444444" }}>Policy Name</label>
            <input
              type="text"
              className="form-control"
              style={{ color: "#444444" }}
              placeholder="e.g. Senior Citizen, PWD, Student"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="row g-3 mb-3">
            <div className="col-6">
              <label className="form-label fw-semibold small" style={{ color: "#444444" }}>Discount Rate (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                className="form-control"
                style={{ color: "#444444" }}
                placeholder="20"
                value={formData.percentage}
                onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
                required
              />
            </div>
            <div className="col-6">
              <label className="form-label fw-semibold small" style={{ color: "#444444" }}>ID Requirement</label>
              <div className="form-check mt-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="requiresIdCheck"
                  checked={formData.requires_id_number}
                  onChange={(e) =>
                    setFormData({ ...formData, requires_id_number: e.target.checked })
                  }
                />
                <label className="form-check-label small" htmlFor="requiresIdCheck" style={{ color: "#444444" }}>
                  Enable Optional ID No. Field
                </label>
              </div>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold small" style={{ color: "#444444" }}>Description (Optional)</label>
            <textarea
              className="form-control"
              rows="2"
              style={{ color: "#444444" }}
              placeholder="Internal notes or policy description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <button
              type="button"
              className="btn btn-light rounded-3 px-3 fw-semibold text-secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn text-white rounded-3 px-4 fw-semibold"
              style={{ backgroundColor: "#2aabe2" }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : editingDiscount ? "Save Changes" : "Create Policy"}
            </button>
          </div>
        </form>
      </Modal>
    </section>
  );
}

export default DiscountSettings;
