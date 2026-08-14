import { useMemo, useState, useEffect, useRef } from "react";
import { fetchPharmacists, createPharmacist, updatePharmacist, deletePharmacist } from "../services/pharmacistService";
import "../assets/css/pharmacists.css";
import { TableSkeleton } from "../components/loading";
import PharmacistPermissionsModal from "./PharmacistPermissionsModal";

const calculateAge = (birthdate) => {
	const today = new Date();
	const birth = new Date(birthdate);
	let age = today.getFullYear() - birth.getFullYear();
	const monthDiff = today.getMonth() - birth.getMonth();
	if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
		age--;
	}
	return age;
};

const getAvatarColor = (birthdate) => {
	const age = calculateAge(birthdate);
	if (age < 25) return "#3b82f6"; // Blue
	if (age < 30) return "#8b5cf6"; // Purple
	if (age < 35) return "#ec4899"; // Pink
	return "#f59e0b"; // Amber
};

const getAvatarInitials = (name) => {
	return name
		.split(" ")
		.slice(0, 2)
		.map((n) => n[0])
		.join("")
		.toUpperCase();
};

function Pharmacists() {
	const [pharmacists, setPharmacists] = useState([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [showModal, setShowModal] = useState(false);
	const [showDetailsModal, setShowDetailsModal] = useState(false);
	const [viewingPharmacist, setViewingPharmacist] = useState(null);
	const [showPermissionsModal, setShowPermissionsModal] = useState(false);
	const [permissionsPharmacist, setPermissionsPharmacist] = useState(null);

	const handleOpenPermissionsModal = (pharmacist) => {
		setPermissionsPharmacist(pharmacist);
		setShowPermissionsModal(true);
	};

	const handlePermissionsUpdated = (updatedUser) => {
		setPharmacists((prev) =>
			prev.map((item) => (item.id === updatedUser.id ? { ...item, ...updatedUser } : item))
		);
	};
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
	const lastSubmitRef = useRef(0);

	const [tableError, setTableError] = useState(null);

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

		// Client side validation
		const errors = {};
		if (!formData.firstName.trim()) {
			errors.firstName = "First name is required.";
		}
		if (!formData.lastName.trim()) {
			errors.lastName = "Last name is required.";
		}
		if (!editingId && !formData.email.trim()) {
			errors.email = "Email address is required.";
		} else if (!editingId && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			errors.email = "Please enter a valid email address.";
		}
		if (!formData.mobile.trim()) {
			errors.mobile = "Mobile number is required.";
		}
		if (!formData.birthdate) {
			errors.birthdate = "Birthdate is required.";
		}

		if (Object.keys(errors).length > 0) {
			setFieldErrors(errors);
			setFormError("Please fill out all required fields correctly.");
			return;
		}

		const now = Date.now();
		if (now - lastSubmitRef.current < 1500) return;
		lastSubmitRef.current = now;

		const payload = {
			first_name: formData.firstName.trim(),
			last_name: formData.lastName.trim(),
			email: formData.email.trim(),
			mobile_number: formData.mobile.trim(),
			date_of_birth: formData.birthdate || null,
			license_number: formData.licenseNumber?.trim() || null,
			is_active: formData.status === "Active",
		};

		setIsSaving(true);
		try {
			if (editingId) {
				await updatePharmacist(editingId, payload);
			} else {
				await createPharmacist(payload);
			}
			await loadPharmacists();
			handleCloseModal();
		} catch (error) {
			console.error("Failed to save pharmacist:", error);
			const isTimeout =
				error.code === "ECONNABORTED" ||
				error.code === "ETIMEDOUT" ||
				error.message?.toLowerCase().includes("timeout") ||
				error.message?.toLowerCase().includes("network error");

			if (isTimeout) {
				setFormError("Server connection timed out. Please check your network and try again.");
			} else if (error.response?.status === 422 && error.response?.data?.errors) {
				const backendErrors = error.response.data.errors;
				const newFieldErrors = {};
				if (backendErrors.first_name) newFieldErrors.firstName = backendErrors.first_name[0];
				if (backendErrors.last_name) newFieldErrors.lastName = backendErrors.last_name[0];
				if (backendErrors.email) newFieldErrors.email = backendErrors.email[0];
				if (backendErrors.mobile_number) newFieldErrors.mobile = backendErrors.mobile_number[0];
				if (backendErrors.date_of_birth) newFieldErrors.birthdate = backendErrors.date_of_birth[0];
				if (backendErrors.license_number) newFieldErrors.licenseNumber = backendErrors.license_number[0];

				setFieldErrors(newFieldErrors);
				setFormError(error.response?.data?.message || "Please fix the validation errors below.");
			} else {
				const message = error.response?.data?.message || error.message || (editingId ? "Failed to update pharmacist account." : "Failed to create pharmacist account.");
				setFormError(message);
			}
		} finally {
			setIsSaving(false);
		}
	};

  	const handleDelete = async (id) => {
		if (!window.confirm("Are you sure you want to delete this pharmacist?")) return;
		try {
			await deletePharmacist(id);
			await loadPharmacists();
		} catch (error) {
			console.error("Failed to delete pharmacist:", error);
		}
	};

	return (
		<section className="dashboard-page pharmacists-page">
			<h4 className="fw-bold mb-1 admin-page-title">
				Pharmacist
			</h4>
			<p className="admin-page-subtitle mb-4">
				List of pharmacist accounts in the pharmacy.
			</p>

			<div className="d-flex justify-content-end mb-3">
			<button type="button" className="btn pharmacists-add-btn" onClick={() => handleOpenModal()}>
					Add new pharmacist
				</button>
			</div>

			<article className="pharmacists-card">
				<div className="pharmacists-toolbar">
					<div className="pharmacists-toolbar-left">
						<h6 className="pharmacists-title mb-0">Pharmacist</h6>
						<span className="pharmacists-count">{rows.length} account(s)</span>
					</div>

					<div className="pharmacists-search-wrap">
						<i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
						<input
							className="form-control pharmacists-search"
							value={search}
							onChange={(event) => setSearch(event.target.value)}
							placeholder="Search by"
							aria-label="Search pharmacists"
						/>
					</div>
				</div>

				<div className="pharmacists-table-scroll">
					<table className="table mb-0 pharmacists-table">
						<thead>
							<tr>
								<th>Employee Number</th>
								<th>Pharmacist Name</th>
								<th>Mobile Number</th>
								<th>Age</th>
								<th>Status</th>
								<th>Action</th>
							</tr>
						</thead>
						<tbody>
							{loading ? (
								<TableSkeleton rows={5} columns={6} showAvatar={false} />
							) : tableError ? (
								<tr>
									<td colSpan={6} className="text-center text-danger py-4">
										<i className="fa-solid fa-triangle-exclamation me-2" />
										{tableError}
									</td>
								</tr>
							) : rows.length === 0 ? (
								<tr className="pharmacists-empty-row" style={{ cursor: "default" }}>
									<td colSpan={6} className="text-center py-5">
										<div className="d-flex flex-column align-items-center justify-content-center py-4">
											<i className="fa-solid fa-user-slash mb-3" style={{ fontSize: "3.5rem", color: "#94a3b8" }} />
											<span className="fw-medium" style={{ fontSize: "15px", color: "#64748b" }}>No pharmacist records found.</span>
										</div>
									</td>
								</tr>
							) : (
								rows.map((item) => (
									<tr key={item.id}>
										<td>{item.pharmacist?.employee_number || "—"}</td>
										<td>{`${item.first_name} ${item.last_name}`}</td>
										<td>{item.mobile_number}</td>
										<td>{item.date_of_birth ? calculateAge(item.date_of_birth) : "N/A"}</td>
										<td>
											<span className={`pharmacists-status-badge pharmacists-status-${item.is_active ? "active" : "inactive"}`}>
												{item.is_active ? "Active" : "Inactive"}
											</span>
										</td>
										<td>
											<div className="d-flex align-items-center gap-2">
												<button
													type="button"
													className="btn btn-sm pharmacists-btn-details"
													onClick={() => handleOpenDetailsModal(item)}
												>
													View Details
												</button>
												<button
													type="button"
													className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1 py-1 px-2 rounded-2"
													style={{ borderColor: "#2aabe2", color: "#2aabe2", fontSize: "0.8rem" }}
													onClick={() => handleOpenPermissionsModal(item)}
													title="Manage Staff Permissions"
												>
													<i className="fa-solid fa-key" />
													Permissions
												</button>
											</div>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</article>

			{/* Modal */}
			{showModal && (
				<div className="pharmacists-modal-overlay" onClick={handleCloseModal}>
					<div className="pharmacists-modal" onClick={(e) => e.stopPropagation()}>
						<div className="pharmacists-modal-header">
							<h5 className="pharmacists-modal-title">
								{editingId ? "Edit pharmacist information" : "Add new pharmacist"}
							</h5>
							<button
								type="button"
								className="pharmacists-modal-close"
								onClick={handleCloseModal}
								aria-label="Close modal"
							>
								<i className="fa-solid fa-xmark" aria-hidden="true" />
							</button>
						</div>

						<form onSubmit={handleSave} className="pharmacists-modal-form" noValidate>
							{formError && (
								<div className="pharmacists-error-banner" role="alert">
									<i className="fa-solid fa-circle-exclamation" aria-hidden="true" />
									<div className="pharmacists-error-banner-content">
										<div className="pharmacists-error-banner-title">{formError}</div>
									</div>
								</div>
							)}

							<div className="pharmacists-form-row">
								<div className="pharmacists-form-group">
									<label className="pharmacists-form-label">First name *</label>
									<input
										type="text"
										className={`form-control pharmacists-form-input ${fieldErrors.firstName ? "is-invalid" : ""}`}
										name="firstName"
										value={formData.firstName}
										onChange={handleInputChange}
										placeholder="Enter first name"
									/>
									{fieldErrors.firstName && (
										<span className="pharmacists-field-error">
											<i className="fa-solid fa-circle-exclamation" style={{ fontSize: "11px" }} />
											{fieldErrors.firstName}
										</span>
									)}
								</div>
								<div className="pharmacists-form-group">
									<label className="pharmacists-form-label">Last name *</label>
									<input
										type="text"
										className={`form-control pharmacists-form-input ${fieldErrors.lastName ? "is-invalid" : ""}`}
										name="lastName"
										value={formData.lastName}
										onChange={handleInputChange}
										placeholder="Enter last name"
									/>
									{fieldErrors.lastName && (
										<span className="pharmacists-field-error">
											<i className="fa-solid fa-circle-exclamation" style={{ fontSize: "11px" }} />
											{fieldErrors.lastName}
										</span>
									)}
								</div>
							</div>

							{!editingId && (
								<div className="pharmacists-form-row pharmacists-form-row-single">
									<div className="pharmacists-form-group">
										<label className="pharmacists-form-label">Email *</label>
										<input
											type="email"
											className={`form-control pharmacists-form-input ${fieldErrors.email ? "is-invalid" : ""}`}
											name="email"
											value={formData.email}
											onChange={handleInputChange}
											placeholder="Enter email address"
										/>
										{fieldErrors.email && (
											<span className="pharmacists-field-error">
												<i className="fa-solid fa-circle-exclamation" style={{ fontSize: "11px" }} />
												{fieldErrors.email}
											</span>
										)}
									</div>
								</div>
							)}

							<div className="pharmacists-form-row">
								<div className="pharmacists-form-group">
									<label className="pharmacists-form-label">Mobile number *</label>
									<input
										type="tel"
										className={`form-control pharmacists-form-input ${fieldErrors.mobile ? "is-invalid" : ""}`}
										name="mobile"
										value={formData.mobile}
										onChange={handleInputChange}
										placeholder="Enter mobile number"
									/>
									{fieldErrors.mobile && (
										<span className="pharmacists-field-error">
											<i className="fa-solid fa-circle-exclamation" style={{ fontSize: "11px" }} />
											{fieldErrors.mobile}
										</span>
									)}
								</div>
								<div className="pharmacists-form-group">
									<label className="pharmacists-form-label">Birthdate *</label>
									<input
										type="date"
										className={`form-control pharmacists-form-input ${fieldErrors.birthdate ? "is-invalid" : ""}`}
										name="birthdate"
										value={formData.birthdate}
										max={`${new Date().getFullYear()}-12-31`}
										onChange={handleInputChange}
									/>
									{fieldErrors.birthdate && (
										<span className="pharmacists-field-error">
											<i className="fa-solid fa-circle-exclamation" style={{ fontSize: "11px" }} />
											{fieldErrors.birthdate}
										</span>
									)}
								</div>
							</div>

							<div className="pharmacists-form-row">
								<div className="pharmacists-form-group">
									<label className="pharmacists-form-label">Status</label>
									<select
										className={`form-control pharmacists-form-input ${fieldErrors.status ? "is-invalid" : ""}`}
										name="status"
										value={formData.status}
										onChange={handleInputChange}
									>
										<option value="Active">Active</option>
										<option value="Inactive">Inactive</option>
									</select>
								</div>
								<div className="pharmacists-form-group">
									<label className="pharmacists-form-label">License number</label>
									<input
										type="text"
										className={`form-control pharmacists-form-input ${fieldErrors.licenseNumber ? "is-invalid" : ""}`}
										name="licenseNumber"
										value={formData.licenseNumber}
										onChange={handleInputChange}
										placeholder="Enter license number"
									/>
									{fieldErrors.licenseNumber && (
										<span className="pharmacists-field-error">
											<i className="fa-solid fa-circle-exclamation" style={{ fontSize: "11px" }} />
											{fieldErrors.licenseNumber}
										</span>
									)}
								</div>
							</div>

							<div className="pharmacists-modal-footer">
								<button
									type="button"
									className="btn pharmacists-btn-cancel"
									onClick={handleCloseModal}
									disabled={isSaving}
								>
									Cancel
								</button>
								<button
									type="submit"
									className="btn pharmacists-btn-save"
									disabled={isSaving}
								>
									{isSaving ? (
										<>
											<span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
											{editingId ? "Saving..." : "Creating..."}
										</>
									) : (
										"Save"
									)}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* View Details Modal */}
			{showDetailsModal && viewingPharmacist && (
				<div className="pharmacists-modal-overlay" onClick={handleCloseDetailsModal}>
					<div className="pharmacists-modal" onClick={(e) => e.stopPropagation()}>
						<div className="pharmacists-modal-header">
							<h5 className="pharmacists-modal-title">
								View pharmacist information
							</h5>
							<button
								type="button"
								className="pharmacists-modal-close"
								onClick={handleCloseDetailsModal}
								aria-label="Close modal"
							>
								<i className="fa-solid fa-xmark" aria-hidden="true" />
							</button>
						</div>

						<div className="pharmacists-details-content">
							<div className="pharmacists-avatar-section">
								<div 
									className="pharmacists-avatar"
									style={{ backgroundColor: getAvatarColor(viewingPharmacist.date_of_birth) }}
								>
									{getAvatarInitials(`${viewingPharmacist.first_name} ${viewingPharmacist.last_name}`)}
								</div>
							</div>

							<div className="pharmacists-details-row">
								<div className="pharmacists-details-group">
									<label className="pharmacists-details-label">First name</label>
									<p className="pharmacists-details-value">
										{viewingPharmacist.first_name}
									</p>
								</div>
								<div className="pharmacists-details-group">
									<label className="pharmacists-details-label">Last name</label>
									<p className="pharmacists-details-value">
										{viewingPharmacist.last_name}
									</p>
								</div>
							</div>

							<div className="pharmacists-details-row pharmacists-details-row-single">
								<div className="pharmacists-details-group">
									<label className="pharmacists-details-label">Email</label>
									<p className="pharmacists-details-value">
										{viewingPharmacist.email}
									</p>
								</div>
							</div>

							<div className="pharmacists-details-row">
								<div className="pharmacists-details-group">
									<label className="pharmacists-details-label">Mobile number</label>
									<p className="pharmacists-details-value">
										{viewingPharmacist.mobile_number}
									</p>
								</div>
								<div className="pharmacists-details-group">
									<label className="pharmacists-details-label">Status</label>
									<p className="pharmacists-details-value">
										<span className={`pharmacists-status-badge pharmacists-status-${viewingPharmacist.is_active ? "active" : "inactive"}`}>
											{viewingPharmacist.is_active ? "Active" : "Inactive"}
										</span>
									</p>
								</div>
							</div>

							<div className="pharmacists-details-row pharmacists-details-row-single">
								<div className="pharmacists-details-group">
									<label className="pharmacists-details-label">License number</label>
									<p className="pharmacists-details-value">
										{viewingPharmacist.pharmacist?.license_number || "—"}
									</p>
								</div>
							</div>
						</div>

						<div className="pharmacists-details-footer">
							<button
								type="button"
								className="btn pharmacists-btn-outline"
								onClick={() => {
									handleOpenModal(viewingPharmacist);
									handleCloseDetailsModal();
								}}
							>
								Edit
							</button>
							<button
								type="button"
								className="btn pharmacists-btn-save"
								onClick={() => {
									handleDelete(viewingPharmacist.id);
									handleCloseDetailsModal();
								}}
							>
								Delete
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Permissions Modal */}
			<PharmacistPermissionsModal
				isOpen={showPermissionsModal}
				onClose={() => setShowPermissionsModal(false)}
				pharmacist={permissionsPharmacist}
				onSuccess={handlePermissionsUpdated}
			/>
		</section>
	);
}

export default Pharmacists;
