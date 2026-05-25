import { useMemo, useState } from "react";
import "../assets/css/pharmacists.css";

const INITIAL_PHARMACISTS = [
	{ id: "USE-1025", name: "Denmar Redondo", mobile: "09123456789", age: 21 },
	{ id: "USE-1026", name: "James Francis Mercado", mobile: "09171234567", age: 27 },
	{ id: "USE-1027", name: "Abigail Barrion", mobile: "09987654321", age: 31 },
	{ id: "USE-1028", name: "James Patrick Orlanes", mobile: "09051234567", age: 26 },
	{ id: "USE-1029", name: "Althea Mishka Alvarez", mobile: "09182345678", age: 29 },
];

function Pharmacists() {
	const [pharmacists, setPharmacists] = useState(INITIAL_PHARMACISTS);
	const [search, setSearch] = useState("");
	const [showModal, setShowModal] = useState(false);
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		mobile: "",
		birthdate: "",
	});
	const [editingId, setEditingId] = useState(null);

	const rows = useMemo(() => {
		const q = search.trim().toLowerCase();

		if (!q) {
			return pharmacists;
		}

		return pharmacists.filter((item) =>
			[item.id, item.name, item.mobile, String(item.age)].join(" ").toLowerCase().includes(q),
		);
	}, [search, pharmacists]);

	const handleOpenModal = (pharmacist = null) => {
		if (pharmacist) {
			const [firstName, ...lastNameParts] = pharmacist.name.split(" ");
			setFormData({
				firstName,
				lastName: lastNameParts.join(" "),
				mobile: pharmacist.mobile,
				birthdate: "",
			});
			setEditingId(pharmacist.id);
		} else {
			setFormData({
				firstName: "",
				lastName: "",
				mobile: "",
				birthdate: "",
			});
			setEditingId(null);
		}
		setShowModal(true);
	};

	const handleCloseModal = () => {
		setShowModal(false);
		setEditingId(null);
		setFormData({
			firstName: "",
			lastName: "",
			mobile: "",
			birthdate: "",
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
						? { ...item, name: fullName, mobile: formData.mobile }
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
					age: formData.birthdate
						? new Date().getFullYear() - new Date(formData.birthdate).getFullYear()
						: 0,
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
								<th>Action</th>
							</tr>
						</thead>
						<tbody>
							{rows.length === 0 ? (
								<tr>
									<td colSpan={5} className="text-center text-muted py-4">
										No pharmacist found.
									</td>
								</tr>
							) : (
								rows.map((item) => (
									<tr key={item.id}>
										<td>{item.id}</td>
										<td>{item.name}</td>
										<td>{item.mobile}</td>
										<td>{item.age}</td>
										<td>
											<button
												type="button"
												className="btn btn-sm pharmacists-action-btn"
												onClick={() => handleOpenModal(item)}
												title="Edit"
											>
												<i className="fa-solid fa-pen-to-square" aria-hidden="true" />
											</button>
											<button
												type="button"
												className="btn btn-sm pharmacists-action-btn pharmacists-action-delete"
												onClick={() => handleDelete(item.id)}
												title="Delete"
											>
												<i className="fa-solid fa-trash" aria-hidden="true" />
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
		</section>
	);
}

export default Pharmacists;
