import React, { useState } from "react";
import { createTicket } from "../../services/ticketService";
import SelectDropdown from "../../shared/components/SelectDropdown";
import successIcon from "../../assets/icons/help-icons/success.svg";

function ReportIssue({ setView }) {
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [ticketRefId, setTicketRefId] = useState("");
    const [userEmail, setUserEmail] = useState("user email");
    const [issueSummary, setIssueSummary] = useState("");
    const [issueCategory, setIssueCategory] = useState("");
    const [issuePriority, setIssuePriority] = useState("");
    const [issueProblem, setIssueProblem] = useState("");
    const [issueSteps, setIssueSteps] = useState("");
    const [issueAttachments, setIssueAttachments] = useState([]);

    const handleReportSubmit = async (e) => {
        e.preventDefault();
        if (!issueSummary.trim() || !issueProblem.trim()) return;

        // Generate Ticket Reference ID
        const refId = "TICK-" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + "-" + Math.floor(1000 + Math.random() * 9000);
        setTicketRefId(refId);

        try {
            // Fetch logged in user email if available
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                const parsed = JSON.parse(storedUser);
                if (parsed.email) setUserEmail(parsed.email);
            }
            
            const payload = {
                title: issueSummary,
                category: issueCategory || "Dashboard",
                priority: issuePriority || "medium",
                description: issueProblem,
                steps_taken: issueSteps ? issueSteps.split('\n').filter(s => s.trim()) : [],
            };
            
            const res = await createTicket(payload);
            setTicketRefId(res?.id ? ('#' + res.id) : refId);
            setShowSuccessModal(true);
        } catch (err) {
            console.error(err);
            alert("Error submitting ticket");
        }
    };

    const handleDoneModal = () => {
        setShowSuccessModal(false);
        setIssueSummary("");
        setIssueCategory("");
        setIssuePriority("");
        setIssueProblem("");
        setIssueSteps("");
        setIssueAttachments([]);
        setView("home");
    };

    return (
        <section className="dashboard-page tech-help-page">
            <header className="admin-page-header mb-4">
                <h4 className="fw-bold mb-1 d-flex align-items-center gap-2 flex-wrap">
                    <span
                        className="tech-help-breadcrumb-parent"
                        onClick={() => setView("home")}
                        role="button"
                        tabIndex={0}
                    >
                        Get Technical Help
                    </span>
                    <i className="fa-solid fa-chevron-right tech-help-breadcrumb-icon" aria-hidden="true" />
                    <span className="admin-page-title">Report an Issue</span>
                </h4>
                <p className="admin-page-subtitle mb-0">
                    Access assistance for troubleshooting, feature use, and other technical concerns.
                </p>
            </header>

            <div className="row g-4 align-items-start">
                <div className="col-12 col-xl-8">
                    <article className="tech-help-ticket-card">
                        <form onSubmit={handleReportSubmit}>
                            <div className="tech-help-form-section">
                                <h3 className="tech-help-form-section-title">
                                    <i className="fa-regular fa-file-lines" aria-hidden="true" />
                                    Ticket Information
                                </h3>
                                <label htmlFor="issueSummary" className="tech-help-form-label">
                                    Subject <span>*</span>
                                </label>
                                <input
                                    id="issueSummary"
                                    type="text"
                                    className="form-control tech-help-form-input"
                                    placeholder="What issue are you experiencing?"
                                    value={issueSummary}
                                    onChange={(e) => setIssueSummary(e.target.value)}
                                    required
                                />
                                <div className="row g-2 mt-1">
                                    <div className="col-12 col-md-6">
                                        <label htmlFor="issueCategory" className="tech-help-form-label">Category <span>*</span></label>
                                        <SelectDropdown
                                            id="issueCategory"
                                            value={issueCategory}
                                            onChange={(val) => setIssueCategory(val)}
                                            options={[
                                                { label: "Dashboard", value: "Dashboard" },
                                                { label: "POS", value: "POS" },
                                                { label: "Pickup Orders", value: "Pickup Orders" },
                                                { label: "Analytics", value: "Analytics" },
                                                { label: "Sales and Reports", value: "Sales and Reports" },
                                                { label: "Pharmacists", value: "Pharmacists" },
                                                { label: "Notifications", value: "Notifications" },
                                                { label: "Settings", value: "Settings" }
                                            ]}
                                            placeholder="Select a category"
                                            selectClassName="tech-help-form-input"
                                        />
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <label htmlFor="issuePriority" className="tech-help-form-label">Priority <span>*</span></label>
                                        <SelectDropdown
                                            id="issuePriority"
                                            value={issuePriority}
                                            onChange={(val) => setIssuePriority(val)}
                                            options={[
                                                { label: "High", value: "high" },
                                                { label: "Medium", value: "medium" },
                                                { label: "Low", value: "low" }
                                            ]}
                                            placeholder="Select a priority level"
                                            selectClassName={`tech-help-form-input ${
                                                issuePriority === 'high' ? 'text-danger fw-semibold' :
                                                issuePriority === 'medium' ? 'text-warning fw-semibold' :
                                                issuePriority === 'low' ? 'text-success fw-semibold' : ''
                                            }`}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="tech-help-form-section">
                                <h3 className="tech-help-form-section-title"><i className="fa-regular fa-file-lines" aria-hidden="true" />Description</h3>
                                <p className="tech-help-form-hint">Please provide a detailed description of the issue you are experiencing.</p>
                                <textarea id="issueProblem" rows="4" className="form-control tech-help-form-input tech-help-textarea" placeholder="Describe your issue in detail..." value={issueProblem} onChange={(e) => setIssueProblem(e.target.value)} required />
                            </div>

                            <div className="tech-help-form-section">
                                <h3 className="tech-help-form-section-title"><i className="fa-regular fa-file-lines" aria-hidden="true" />Steps Taken</h3>
                                <p className="tech-help-form-hint">Tell us what you did before and when the issue occurred.</p>
                                <textarea id="issueSteps" rows="3" className="form-control tech-help-form-input tech-help-textarea" placeholder={'1. Go to ...\n\n2. Click ...\n\n3. Observe ...'} value={issueSteps} onChange={(e) => setIssueSteps(e.target.value)} />
                            </div>

                            <div className="tech-help-form-section tech-help-attachments-section">
                                <h3 className="tech-help-form-section-title"><i className="fa-solid fa-paperclip" aria-hidden="true" />Attachments <small>(optional)</small></h3>
                                <p className="tech-help-form-hint">Add screenshots or files that can help us understand the issue.</p>
                                <label htmlFor="issueAttachments" className="tech-help-upload-box">
                                    <i className="fa-solid fa-arrow-up-from-bracket" aria-hidden="true" />
                                    <span><strong>Upload files here</strong><small>PNG, JPG, PDF up to 10MB each</small></span>
                                </label>
                                <input id="issueAttachments" type="file" className="visually-hidden" multiple accept=".png,.jpg,.jpeg,.pdf" onChange={(e) => setIssueAttachments(Array.from(e.target.files || []))} />
                                {issueAttachments.length > 0 && <p className="tech-help-selected-files">{issueAttachments.length} file{issueAttachments.length === 1 ? "" : "s"} selected</p>}
                            </div>

                            <div className="tech-help-form-actions">
                                <button type="button" className="btn tech-help-cancel-btn" onClick={() => setView("home")}>Cancel</button>
                                <button type="submit" className="btn tech-help-primary-btn">
                                    <i className="fa-regular fa-paper-plane" aria-hidden="true" /> Submit Ticket
                                </button>
                            </div>
                        </form>
                    </article>
                </div>

                <div className="col-12 col-xl-4">
                    <article className="tech-help-availability-card">
                        <h3 className="tech-help-availability-title"><i className="fa-solid fa-magnifying-glass" aria-hidden="true" />Support Availability</h3>
                        <div className="tech-help-availability-item">
                            <i className="fa-solid fa-ticket" aria-hidden="true" />
                            <div><strong>Ticket Submission</strong><small>Submit your tickets anytime.</small></div>
                            <span>Available 24/7</span>
                        </div>
                        <div className="tech-help-availability-item">
                            <i className="fa-regular fa-clock" aria-hidden="true" />
                            <div><strong>Expected Response Time</strong><small>We aim to respond to your ticket within</small></div>
                            <span>Within 1-2 days</span>
                        </div>
                    </article>
                </div>
            </div>

            {/* Submitted Ticket Success Modal */}
            {showSuccessModal && (
                <div className="modal-backdrop-custom" onClick={() => setShowSuccessModal(false)}>
                    <div className="modal-content-custom modal-sm-ticket" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header-gradient">
                            <div></div>
                            <button className="modal-close-btn" onClick={() => setShowSuccessModal(false)}>
                                <i className="fa-solid fa-xmark" />
                            </button>
                        </div>
                        <div className="p-4 text-center">
                            <div className="mb-3">
                                <img src={successIcon} alt="Success Checkmark" width="72" height="72" />
                            </div>

                            <h4 className="fw-bold tech-help-soft-black mb-3" style={{ fontSize: "20px" }}>
                                Ticket Successfully Submitted
                            </h4>

                            <p className="text-muted mb-3" style={{ fontSize: "13.5px", lineHeight: "1.5" }}>
                                Your support ticket has been received and added to our queue. We have sent a confirmation email with your ticket details to the user [ <strong>{userEmail}</strong> ].
                            </p>

                            <div className="ticket-ref-box mb-3 p-2 rounded">
                                <p className="mb-0 tech-help-soft-black fw-bold" style={{ fontSize: "14px" }}>
                                    Ticket Reference ID: <span style={{ color: "#2aabe2" }}>[{ticketRefId}]</span>
                                </p>
                            </div>

                            <p className="text-muted mb-4" style={{ fontSize: "13px", lineHeight: "1.5" }}>
                                A support specialist will review your issue and respond shortly , usually within 2 hour.
                            </p>

                            <button
                                type="button"
                                className="btn tech-help-primary-btn w-100 py-2"
                                style={{ fontSize: "14px", fontWeight: "700" }}
                                onClick={handleDoneModal}
                            >
                                DONE
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

export default ReportIssue;