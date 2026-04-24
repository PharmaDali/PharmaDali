import { useMemo, useState } from "react";
import "../assets/css/pharmacists.css";

const PHARMACISTS = [
	{ id: "USE-1025", name: "Denmar Redondo", mobile: "09123456789", age: 21 },
	{ id: "USE-1026", name: "James Francis Mercado", mobile: "09171234567", age: 27 },
	{ id: "USE-1027", name: "Abigail Barrion", mobile: "09987654321", age: 31 },
	{ id: "USE-1028", name: "James Patrick Orlanes", mobile: "09051234567", age: 26 },
	{ id: "USE-1029", name: "Althea Mishka Alvarez", mobile: "09182345678", age: 29 },
];

function Pharmacists() {
	const [search, setSearch] = useState("");

	const rows = useMemo(() => {
		const q = search.trim().toLowerCase();

		if (!q) {
			return PHARMACISTS;
		}

		return PHARMACISTS.filter((item) =>
			[item.id, item.name, item.mobile, String(item.age)].join(" ").toLowerCase().includes(q),
		);
	}, [search]);

	return (
		<section className="dashboard-page pharmacists-page">
			<h4 className="fw-bold mb-1" style={{ color: "#2aabe2" }}>
				Pharmacist
			</h4>
			<p className="text-muted mb-4" style={{ fontSize: 13 }}>
				List of pharmacist accounts related in the pharmacy.
			</p>

			<div className="d-flex justify-content-end mb-3">
				<button type="button" className="btn pharmacists-add-btn">
					<i className="fa-solid fa-plus me-2" aria-hidden="true" />
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
							</tr>
						</thead>
						<tbody>
							{rows.length === 0 ? (
								<tr>
									<td colSpan={4} className="text-center text-muted py-4">
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
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</article>
		</section>
	);
}

export default Pharmacists;
