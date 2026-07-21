import { useEffect, useState } from "react";
import { Breadcrumb } from "./Breadcrumb";
import "../../assets/css/settings/common.css";
import "../../assets/css/settings.css";

const DATA_OPTIONS = [
	{ id: "sales", label: "Sales Transactions"},
	{ id: "inventory", label: "Inventory Data"},
	{ id: "products", label: "Product List" },
];

const DATE_RANGES = [
	"March 1, 2026 - March 3, 2026",
	"March 4, 2026 - March 10, 2026",
	"March 11, 2026 - March 17, 2026",
];

const FILE_FORMATS = [
	{ id: "csv", label: "CSV", helper: "Export data in CSV format." },
	{ id: "xlsx", label: "Excel (.xlsx)", helper: "Export data in Excel format." },
];

const EXPORT_SCOPES = [
	{ id: "summary", label: "Summary Only", helper: "Export summarized data." },
	{ id: "detailed", label: "Detailed Records", helper: "Export complete detailed records." },
];

const ExportData = ({ onNavigate }) => {
	const [isEditing, setIsEditing] = useState(false);
	const [selectedData, setSelectedData] = useState(["sales", "inventory", "products"]);
	const [dateRange, setDateRange] = useState(DATE_RANGES[0]);
	const [fileFormat, setFileFormat] = useState("csv");
	const [exportScope, setExportScope] = useState("summary");

	useEffect(() => {
		const stored = localStorage.getItem("pharmadali.exportDataSettings");
		if (!stored) return;
		try {
			const parsed = JSON.parse(stored);
			if (Array.isArray(parsed.selectedData)) setSelectedData(parsed.selectedData);
			if (typeof parsed.dateRange === "string") setDateRange(parsed.dateRange);
			if (typeof parsed.fileFormat === "string") setFileFormat(parsed.fileFormat);
			if (typeof parsed.exportScope === "string") setExportScope(parsed.exportScope);
		} catch (error) {
			console.warn("Failed to read export data settings", error);
		}
	}, []);

	const toggleSelection = (id) => {
		if (!isEditing) return;
		setSelectedData((prev) =>
			prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
		);
	};

	const handleExport = () => {
		// Add export logic here.
	};

	const handleSaveChanges = () => {
		const payload = {
			selectedData,
			dateRange,
			fileFormat,
			exportScope,
		};
		localStorage.setItem("pharmadali.exportDataSettings", JSON.stringify(payload));
		setIsEditing(false);
	};

	return (
		<>
			<Breadcrumb
				crumbs={[
					{ label: "Settings", view: "settings" },
					{ label: "Export Data", view: "export" },
				]}
				onNavigate={onNavigate}
			/>

			<header className="settings-detail-header">
				<div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
					<div>
						<h5 className="fw-bold settings-detail-title">Export Data</h5>
						<p className="settings-detail-subtitle">Export your system data into downloadable files.</p>
					</div>
					<div className="settings-button-group">
						<button
							className="btn btn-outline-primary btn-sm"
							onClick={() => setIsEditing(true)}
							disabled={isEditing}
						>
							Edit
						</button>
						<button
							className="btn btn-primary btn-sm d-flex align-items-center gap-2"
							onClick={handleSaveChanges}
							disabled={!isEditing || !selectedData.length}
						>
							Save Changes
						</button>
					</div>
				</div>
			</header>

			<div className="settings-form-container export-data-container">
				<section className="export-section">
					<div className="export-section-head">
						<div>
							<h6 className="export-section-title">Data Selection</h6>
							<p className="export-section-subtitle">Select the type of data you want to export.</p>
						</div>
					</div>
					<div className="export-options-grid">
						{DATA_OPTIONS.map((option) => (
							<button
								key={option.id}
								type="button"
								className={`export-option-card${selectedData.includes(option.id) ? " is-selected" : ""}`}
								onClick={() => toggleSelection(option.id)}
								disabled={!isEditing}
							>
								<label className="pd-checkbox-container">
									<input
										type="checkbox"
										className="pd-checkbox"
										checked={selectedData.includes(option.id)}
										onChange={() => toggleSelection(option.id)}
										disabled={!isEditing}
									/>
									<span className="pd-checkbox-label">{option.label}</span>
								</label>
								<span className="export-option-icon">
									<i className={`bi ${option.icon}`} />
								</span>
							</button>
						))}
					</div>
				</section>

				<section className="export-section">
					<div className="export-section-head">
						<div>
							<h6 className="export-section-title">Filters</h6>
							<p className="export-section-subtitle">Choose the date range for the data you want to export.</p>
						</div>
					</div>
					<div className="export-form-row">
						<label className="settings-form-label">Date Range</label>
						<div className="export-select-wrap">
							<select
								className="form-select export-select"
								value={dateRange}
								onChange={(e) => setDateRange(e.target.value)}
								disabled={!isEditing}
							>
								{DATE_RANGES.map((range) => (
									<option key={range} value={range}>
										{range}
									</option>
								))}
							</select>
							<i className="bi bi-chevron-down export-select-icon" />
						</div>
					</div>
				</section>

				<section className="export-section">
					<div className="export-section-head">
						<div>
							<h6 className="export-section-title">File Configuration</h6>
							<p className="export-section-subtitle">Choose your preferred file format and export scope.</p>
						</div>
					</div>
					<div className="export-config-grid">
						<div>
							<p className="export-config-title">File Format</p>
							<div className="export-radio-group">
								{FILE_FORMATS.map((format) => (
									<label key={format.id} className="export-radio-card">
										<input
											type="radio"
											name="fileFormat"
											className="pd-radio"
											checked={fileFormat === format.id}
											onChange={() => setFileFormat(format.id)}
											disabled={!isEditing}
										/>
										<div>
											<span className="export-radio-title">{format.label}</span>
											<span className="export-radio-helper">{format.helper}</span>
										</div>
									</label>
								))}
							</div>
						</div>
						<div>
							<p className="export-config-title">Export Scope</p>
							<div className="export-radio-group">
								{EXPORT_SCOPES.map((scope) => (
									<label key={scope.id} className="export-radio-card">
										<input
											type="radio"
											name="exportScope"
											className="pd-radio"
											checked={exportScope === scope.id}
											onChange={() => setExportScope(scope.id)}
											disabled={!isEditing}
										/>
										<div>
											<span className="export-radio-title">{scope.label}</span>
											<span className="export-radio-helper">{scope.helper}</span>
										</div>
									</label>
								))}
							</div>
						</div>
					</div>
				</section>

				<section className="export-section export-section-action">
					<div className="export-section-head">
						<div>
							<h6 className="export-section-title">Action</h6>
							<p className="export-section-subtitle">Click the button below to export your data.</p>
						</div>
					</div>
					<div className="export-action">
						<button className="btn btn-primary d-flex align-items-center gap-2" onClick={handleExport}>
							<i className="bi bi-download" />
							Export Data
						</button>
					</div>
				</section>
			</div>
		</>
	);
};

export default ExportData;
