import { useMemo, useState } from "react";
import "../assets/css/pharmacists.css";

const INITIAL_PHARMACISTS = [
	{ id: "USE-1025", name: "Denmar Redondo", mobile: "09123456789", birthdate: "2005-03-15", status: "Active", licenseNumber: "LIC-2024-0001" },
	{ id: "USE-1026", name: "James Francis Mercado", mobile: "09171234567", birthdate: "1998-07-22", status: "Active", licenseNumber: "LIC-2023-0147" },
	{ id: "USE-1027", name: "Abigail Barrion", mobile: "09987654321", birthdate: "1994-02-18", status: "Active", licenseNumber: "LIC-2022-0984" },
	{ id: "USE-1028", name: "James Patrick Orlanes", mobile: "09051234567", birthdate: "1999-11-08", status: "Inactive", licenseNumber: "LIC-2021-0662" },
	{ id: "USE-1029", name: "Althea Mishka Alvarez", mobile: "09182345678", birthdate: "1996-05-28", status: "Active", licenseNumber: "LIC-2020-0319" },
];

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
	const [pharmacists, setPharmacists] = useState(INITIAL_PHARMACISTS);
	const [search, setSearch] = useState("");
	const [showModal, setShowModal] = useState(false);
	const [showDetailsModal, setShowDetailsModal] = useState(false);
	const [viewingPharmacist, setViewingPharmacist] = useState(null);
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		mobile: "",
		birthdate: "",
		status: "Active",
		licenseNumber: "",
	});
	const [editingId, setEditingId] = useState(null);

	const rows = useMemo(() => {
		const q = search.trim().toLowerCase();

		if (!q) {
			return pharmacists;
		}

		return pharmacists.filter((item) =>
			[item.id, item.name, item.mobile].join(" ").toLowerCase().includes(q),
		);
	}, [search, pharmacists]);

	const handleOpenModal = (pharmacist = null) => {
		if (pharmacist) {
			const [firstName, ...lastNameParts] = pharmacist.name.split(" ");
			setFormData({
				firstName,
				lastName: lastNameParts.join(" "),
				mobile: pharmacist.mobile,
				birthdate: pharmacist.birthdate || "",
				status: pharmacist.status || "Active",
				licenseNumber: pharmacist.licenseNumber || "",
			});
			setEditingId(pharmacist.id);
		} else {
			setFormData({
				firstName: "",
				lastName: "",
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

	const handleSave = (e) => {
		e.preventDefault();
		const fullName = `${formData.firstName} ${formData.lastName}`.trim();

		if (editingId) {
			// Update existing pharmacist
			setPharmacists((prev) =>
				prev.map((item) =>
					item.id === editingId
						? {
								...item,
								name: fullName,
								mobile: formData.mobile,
								birthdate: formData.birthdate,
								status: formData.status,
								licenseNumber: formData.licenseNumber,
							}
					: item,
				),
			);
		} else {
			// Add new pharmacist
			const newId = `USE-${String(Math.max(...pharmacists.map((p) => parseInt(p.id.split("-")[1])), 0) + 1).padStart(4, "0")}`;
			setPharmacists((prev) => [
				...prev,
				{
					id: newId,
					name: fullName,
					mobile: formData.mobile,
					birthdate: formData.birthdate,
					status: formData.status,
					licenseNumber: formData.licenseNumber,
				},
			]);
		}
		handleCloseModal();
	};

	const handleDelete = (id) => {
		if (window.confirm("Are you sure you want to delete this pharmacist?")) {
			setPharmacists((prev) => prev.filter((item) => item.id !== id));
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
								<th>ID</th>
								<th>Pharmacist Name</th>
								<th>Mobile Number</th>
								<th>Age</th>
								<th>Status</th>
								<th>Action</th>
							</tr>
						</thead>
						<tbody>
							{rows.length === 0 ? (
								<tr>
									<td colSpan={6} className="text-center text-muted py-4">
										No pharmacist found.
									</td>
								</tr>
							) : (
								rows.map((item) => (
									<tr key={item.id}>
										<td>{item.id}</td>
										<td>{item.name}</td>
										<td>{item.mobile}</td>
										<td>{calculateAge(item.birthdate)}</td>
										<td>
											<span className={`pharmacists-status-badge pharmacists-status-${item.status.toLowerCase()}`}>
												{item.status}
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
								>
									Cancel
								</button>
								<button
									type="submit"
									className="btn pharmacists-btn-save"
								>
									Save
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
									style={{ backgroundColor: getAvatarColor(viewingPharmacist.birthdate) }}
								>
									{getAvatarInitials(viewingPharmacist.name)}
								</div>
							</div>

							<div className="pharmacists-details-row">
								<div className="pharmacists-details-group">
									<label className="pharmacists-details-label">First name</label>
									<p className="pharmacists-details-value">
										{viewingPharmacist.name.split(" ")[0]}
									</p>
								</div>
								<div className="pharmacists-details-group">
									<label className="pharmacists-details-label">Last name</label>
									<p className="pharmacists-details-value">
										{viewingPharmacist.name.split(" ").slice(1).join(" ")}
									</p>
								</div>
							</div>

							<div className="pharmacists-details-row">
								<div className="pharmacists-details-group">
									<label className="pharmacists-details-label">Mobile number</label>
									<p className="pharmacists-details-value">
										{viewingPharmacist.mobile}
									</p>
								</div>
								<div className="pharmacists-details-group">
									<label className="pharmacists-details-label">Status</label>
									<p className="pharmacists-details-value">
										<span className={`pharmacists-status-badge pharmacists-status-${viewingPharmacist.status.toLowerCase()}`}>
											{viewingPharmacist.status}
										</span>
									</p>
								</div>
							</div>

							<div className="pharmacists-details-row pharmacists-details-row-single">
								<div className="pharmacists-details-group">
									<label className="pharmacists-details-label">License number</label>
									<p className="pharmacists-details-value">
										{viewingPharmacist.licenseNumber || "—"}
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
