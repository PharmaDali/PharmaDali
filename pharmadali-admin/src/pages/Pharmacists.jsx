import { useMemo, useState, useEffect, useRef } from "react";
import { fetchPharmacists, createPharmacist, updatePharmacist, deletePharmacist } from "../services/pharmacistService";
import "../assets/css/pharmacists.css";

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
	const lastSubmitRef = useRef(0);

	const loadPharmacists = async () => {
		try {
			setLoading(true);
			const response = await fetchPharmacists();
			setPharmacists(response);
		} catch (error) {
			console.error("Failed to load pharmacists:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadPharmacists();
	}, []);

	const rows = useMemo(() => {
		const q = search.trim().toLowerCase();

		if (!q) {
			return pharmacists;
		}

		return pharmacists.filter((item) => {
			const fullName = `${item.first_name} ${item.last_name}`.toLowerCase();
			const empNumber = item.pharmacist?.employee_number?.toLowerCase() || "";
			return fullName.includes(q) || empNumber.includes(q) || (item.mobile_number || "").includes(q);
		});
	}, [search, pharmacists]);

	const handleOpenModal = (pharmacist = null) => {
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
	};

	const handleSave = async (e) => {
		e.preventDefault();

		const now = Date.now();
		if (now - lastSubmitRef.current < 2000) return;
		lastSubmitRef.current = now;

		const payload = {
			first_name: formData.firstName,
			last_name: formData.lastName,
			email: formData.email,
			mobile_number: formData.mobile,
			date_of_birth: formData.birthdate || null,
			license_number: formData.licenseNumber || null,
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
			alert(error.message || (editingId ? "Failed to update pharmacist" : "Failed to create pharmacist"));
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
			alert(error.message || "Failed to delete pharmacist");
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
								<tr>
									<td colSpan={6} className="text-center text-muted py-4">
										Loading pharmacists...
									</td>
								</tr>
							) : rows.length === 0 ? (
								<tr>
									<td colSpan={6} className="text-center text-muted py-4">
										No pharmacist found.
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
											<button
												type="button"
												className="btn btn-sm pharmacists-btn-details"
												onClick={() => handleOpenDetailsModal(item)}
											>
												View Details
											</button>
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

						<form onSubmit={handleSave} className="pharmacists-modal-form">
							<div className="pharmacists-form-row">
								<div className="pharmacists-form-group">
									<label className="pharmacists-form-label">First name</label>
									<input
										type="text"
										className="form-control pharmacists-form-input"
										name="firstName"
										value={formData.firstName}
										onChange={handleInputChange}
										placeholder="Enter first name"
										required
									/>
								</div>
								<div className="pharmacists-form-group">
									<label className="pharmacists-form-label">Last name</label>
									<input
										type="text"
										className="form-control pharmacists-form-input"
										name="lastName"
										value={formData.lastName}
										onChange={handleInputChange}
										placeholder="Enter last name"
										required
									/>
								</div>
							</div>

{!editingId && (
						<div className="pharmacists-form-row pharmacists-form-row-single">
							<div className="pharmacists-form-group">
								<label className="pharmacists-form-label">Email</label>
								<input
									type="email"
									className="form-control pharmacists-form-input"
									name="email"
									value={formData.email}
									onChange={handleInputChange}
									placeholder="Enter email address"
									required
								/>
							</div>
						</div>
					)}

							<div className="pharmacists-form-row">
								<div className="pharmacists-form-group">
									<label className="pharmacists-form-label">Mobile number</label>
									<input
										type="tel"
										className="form-control pharmacists-form-input"
										name="mobile"
										value={formData.mobile}
										onChange={handleInputChange}
										placeholder="Enter mobile number"
										required
									/>
								</div>
								<div className="pharmacists-form-group">
									<label className="pharmacists-form-label">Birthdate</label>
									<input
										type="date"
										className="form-control pharmacists-form-input"
										name="birthdate"
										value={formData.birthdate}
										onChange={handleInputChange}
										required
									/>
								</div>
							</div>

							<div className="pharmacists-form-row">
								<div className="pharmacists-form-group">
									<label className="pharmacists-form-label">Status</label>
									<select
										className="form-control pharmacists-form-input"
										name="status"
										value={formData.status}
										onChange={handleInputChange}
										required
									>
										<option value="Active">Active</option>
										<option value="Inactive">Inactive</option>
									</select>
								</div>
								<div className="pharmacists-form-group">
									<label className="pharmacists-form-label">License number</label>
									<input
										type="text"
										className="form-control pharmacists-form-input"
										name="licenseNumber"
										value={formData.licenseNumber}
										onChange={handleInputChange}
										placeholder="Enter license number"
									/>
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
		</section>
	);
}

export default Pharmacists;
