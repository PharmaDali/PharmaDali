import { useMemo, useState } from "react";
import "../assets/css/get-technical-help.css";
import successfulIcon from "../assets/icons/modal-icons/successful-task.svg";

const SUPPORT_LINKS = [
    {
        id: "docs",
        icon: "fa-book-open",
        title: "System Documentation",
        description: "Explore setup guides, integration walkthroughs, and architecture references.",
        actionLabel: "Open documentation",
        href: "#",
    },
    {
        id: "troubleshoot",
        icon: "fa-screwdriver-wrench",
        title: "Troubleshooting Guide",
        description: "Follow practical fixes for login, sync, network, and workflow issues.",
        actionLabel: "View guide",
        view: "troubleshoot",
    },
    {
        id: "contact",
        icon: "fa-headset",
        title: "Contact Support",
        description: "Create a support ticket or reach the technical team through priority channels.",
        actionLabel: "Contact support",
        view: "contact",
    },
];

const FAQ_ITEMS = [
    {
        id: 1,
        question: "Why is my branch inventory not syncing?",
        answer: "Check your internet connection, verify branch selection, then retry sync from Inventory settings.",
    },
    {
        id: 2,
        question: "How do I reset my session after timeout?",
        answer: "Sign out, close the browser tab, then log back in. This refreshes your active session securely.",
    },
    {
        id: 3,
        question: "Why can't I access forecast and reports?",
        answer: "Your account role may not have permission yet. Ask your admin to review your access level.",
    },
    {
        id: 4,
        question: "What should I include when creating a support ticket?",
        answer: "Provide branch name, user role, issue summary, screenshot, and the exact time the error happened.",
    },
    {
        id: 5,
        question: "How can I speed up page loading?",
        answer: "Clear browser cache, avoid multiple heavy tabs, and use a stable network connection.",
    },
    {
        id: 6,
        question: "Can I recover unsaved ticket details?",
        answer: "Unsaved form data is not stored automatically. Copy long descriptions before switching pages.",
    },
    {
        id: 7,
        question: "Why does POS show incomplete product data?",
        answer: "Refresh the POS view and verify product setup in Inventory. Missing fields may hide products.",
    },
    {
        id: 8,
        question: "How often is support available?",
        answer: "Live chat and ticketing are monitored during support hours, with priority handling for urgent issues.",
    },
    {
        id: 9,
        question: "How do I report a recurring bug?",
        answer: "Submit one ticket with all occurrences and timestamps so support can trace the pattern quickly.",
    },
    {
        id: 10,
        question: "Where can I find release updates?",
        answer: "System update notes are posted in documentation and reflected in the version information section.",
    },
];

function SupportHome({ onNavigate }) {
    return (
        <section className="dashboard-page tech-help-page">
            <header className="admin-page-header">
                <h4 className="fw-bold mb-1 admin-page-title">Technical Support Center</h4>
                <p className="admin-page-subtitle">
                    Search for guides, quick fixes, and support channels.
                </p>
            </header>

            <div className="tech-help-search-wrap mb-4">
                <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
                <input
                    type="text"
                    className="form-control tech-help-search"
                    placeholder="Search documentation, errors, or support topics"
                    aria-label="Search support topics"
                />
            </div>

            <div className="row g-3 mb-4 tech-help-home-grid">
                {SUPPORT_LINKS.map((item) => (
                    <div key={item.id} className="col-12 col-md-6 col-xl-4">
                        <article className="tech-help-card tech-help-home-card h-100">
                            <div className="tech-help-card-icon mb-3">
                                <i className={`fa-solid ${item.icon}`} aria-hidden="true" />
                            </div>
                            <h6 className="tech-help-card-title mb-3">{item.title}</h6>
                            <p className="tech-help-card-copy tech-help-home-copy mb-3">{item.description}</p>

                            {item.view ? (
                                <button
                                    type="button"
                                    className="btn btn-link p-0 tech-help-link"
                                    onClick={() => onNavigate(item.view)}
                                >
                                    {item.actionLabel}
                                    <i className="fa-solid fa-arrow-right-long ms-2" aria-hidden="true" />
                                </button>
                            ) : (
                                <a href={item.href} className="tech-help-link">
                                    {item.actionLabel}
                                    <i className="fa-solid fa-arrow-right-long ms-2" aria-hidden="true" />
                                </a>
                            )}
                        </article>
                    </div>
                ))}
            </div>

            <article className="tech-help-version-card d-inline-flex flex-wrap align-items-center gap-2" aria-label="System Version Information">
                <p className="mb-0 tech-help-version-label">System Version Information</p>
                <span className="tech-help-version-divider" aria-hidden="true">•</span>
                <p className="mb-0 tech-help-version-item">
                    <span>App Version</span>
                    <strong>v4.2.0</strong>
                </p>
                <span className="tech-help-version-divider" aria-hidden="true">•</span>
                <p className="mb-0 tech-help-version-item">
                    <span>Last Build</span>
                    <strong>January 23, 2026</strong>
                </p>
            </article>
        </section>
    );
}

function ContactSupportView({ onBack }) {
    const [submitted, setSubmitted] = useState(false);
    const [showCallbackModal, setShowCallbackModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [ticketRefId, setTicketRefId] = useState("");
    const [callbackData, setCallbackData] = useState({
        phone: "",
        bestTime: "",
        summary: "",
    });

    const handleSubmit = (event) => {
        event.preventDefault();
        setSubmitted(true);
    };

    const handleCallbackClick = () => {
        setShowCallbackModal(true);
    };

    const handleCallbackClose = () => {
        setShowCallbackModal(false);
        setCallbackData({ phone: "", bestTime: "", summary: "" });
    };

    const handleCallbackChange = (e) => {
        const { name, value } = e.target;
        setCallbackData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCallbackSubmit = (e) => {
        e.preventDefault();
        // Generate a ticket reference ID
        const refId = "TKT-" + Date.now().toString().slice(-8);
        setTicketRefId(refId);
        setShowSuccessModal(true);
        setShowCallbackModal(false);
        setCallbackData({ phone: "", bestTime: "", summary: "" });
    };

    const handleSuccessModalClose = () => {
        setShowSuccessModal(false);
        setTicketRefId("");
    };

    return (
        <>
        <section className="dashboard-page tech-help-page">
            <button type="button" className="btn btn-link p-0 tech-help-back-link" onClick={onBack}>
                <i className="fa-solid fa-arrow-left me-2" aria-hidden="true" />
                Back to Technical Support Center
            </button>

            <h4 className="fw-bold mt-2 mb-4 admin-page-title">
                Contact Support
            </h4>

            <p className="text-muted mb-4">
                Describe the issue, and the support team will respond as soon as possible.
            </p>

            <div className="row g-4">
                <div className="col-12 col-xl-8">
                    <article className="tech-help-card">
                        <form onSubmit={handleSubmit}>
                            <label htmlFor="issue-summary" className="form-label tech-help-form-label">
                                Issue Summary
                            </label>
                            <input
                                id="issue-summary"
                                type="text"
                                className="form-control tech-help-input mb-3"
                                placeholder="Brief summary of the issue"
                            />

                            <label htmlFor="issue-problem" className="form-label tech-help-form-label">
                                Describe the Problem
                            </label>
                            <textarea
                                id="issue-problem"
                                rows="6"
                                className="form-control tech-help-input tech-help-textarea"
                                placeholder="Provide details, steps to reproduce, and expected behavior"
                            />

                            <div className="d-flex flex-wrap justify-content-between gap-2 mt-4">
                                <button type="submit" className="btn tech-help-submit-btn">
                                    Submit Support Ticket
                                </button>
                                <button type="button" className="btn tech-help-callback-btn" onClick={handleCallbackClick}>
                                    <i className="fa-solid fa-phone-volume me-2" aria-hidden="true" />
                                    Request Priority Callback
                                </button>
                            </div>

                            {submitted && (
                                <p className="tech-help-inline-message mb-0 mt-3">
                                    Ticket submitted. Our support team will review this shortly.
                                </p>
                            )}
                        </form>
                    </article>
                </div>

                <div className="col-12 col-xl-4">
                    <article className="tech-help-card h-100">
                        <h6 className="tech-help-card-title mb-4">Support Channels</h6>

                        <div className="tech-help-live-chat mb-4">
                            <div className="d-flex align-items-start gap-2 mb-3">
                                <i className="fa-solid fa-message" aria-hidden="true" />
                                <div>
                                    <h6 className="mb-1">Live Chat</h6>
                                    <p className="mb-0">We are here to help</p>
                                </div>
                            </div>
                            <button type="button" className="btn tech-help-start-chat-btn w-100">
                                Start Chat
                            </button>
                        </div>

                        <div className="d-flex flex-column gap-3">
                            <div className="d-flex align-items-start gap-2">
                                <i className="fa-solid fa-phone" aria-hidden="true" />
                                <div>
                                    <h6 className="mb-1">Phone Support</h6>
                                    <p className="mb-0">1-8096-905 (Priority Line)</p>
                                </div>
                            </div>

                            <div className="d-flex align-items-start gap-2">
                                <i className="fa-regular fa-envelope" aria-hidden="true" />
                                <div>
                                    <h6 className="mb-1">Mail Support</h6>
                                    <p className="mb-0">pharmadali@gmail.com</p>
                                </div>
                            </div>
                        </div>
                    </article>
                </div>
            </div>
        </section>

        {showCallbackModal && (
            <div
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 1000,
                }}
                onClick={handleCallbackClose}
            >
                <div
                    style={{
                        backgroundColor: "white",
                        borderRadius: "12px",
                        overflow: "hidden",
                        maxWidth: "420px",
                        width: "90%",
                        maxHeight: "90vh",
                        overflowY: "auto",
                        position: "relative",
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div
                        style={{
                            background: "linear-gradient(135deg, #48AAD9 0%, #48AAD9 100%)",
                            padding: "20px 24px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            color: "white",
                        }}
                    >
                        <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>
                            Priority Callback Request
                        </h3>
                        <button
                            onClick={handleCallbackClose}
                            style={{
                                background: "none",
                                border: "none",
                                fontSize: "24px",
                                cursor: "pointer",
                                color: "white",
                                padding: 0,
                            }}
                        >
                            ✕
                        </button>
                    </div>

                    <form onSubmit={handleCallbackSubmit} style={{ padding: "24px" }}>
                        <div style={{ marginBottom: "20px" }}>
                            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", fontSize: "14px", color: "#333" }}>
                                Phone number for callback:
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={callbackData.phone}
                                onChange={handleCallbackChange}
                                placeholder="+1 (555) 000-0000"
                                style={{
                                    width: "100%",
                                    padding: "10px 12px",
                                    border: "1px solid #e0e0e0",
                                    borderRadius: "6px",
                                    fontSize: "14px",
                                    backgroundColor: "#f5f5f5",
                                }}
                                required
                            />
                        </div>

                        <div style={{ marginBottom: "20px" }}>
                            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", fontSize: "14px", color: "#333" }}>
                                Best Time to Call:
                            </label>
                            <select
                                name="bestTime"
                                value={callbackData.bestTime}
                                onChange={handleCallbackChange}
                                style={{
                                    width: "100%",
                                    padding: "10px 12px",
                                    border: "1px solid #e0e0e0",
                                    borderRadius: "6px",
                                    fontSize: "14px",
                                    backgroundColor: "#f5f5f5",
                                }}
                                required
                            >
                                <option value="">Select time:</option>
                                <option value="09:00">9:00 AM - 10:00 AM</option>
                                <option value="10:00">10:00 AM - 11:00 AM</option>
                                <option value="11:00">11:00 AM - 12:00 PM</option>
                                <option value="14:00">2:00 PM - 3:00 PM</option>
                                <option value="15:00">3:00 PM - 4:00 PM</option>
                                <option value="16:00">4:00 PM - 5:00 PM</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: "12px", padding: "12px", backgroundColor: "#f0f7ff", borderRadius: "6px" }}>
                            <p style={{ margin: 0, fontSize: "13px", color: "#666" }}>
                                <strong>Operating Hours:</strong> 8:00 AM - 2:00 PM
                            </p>
                        </div>

                        <div style={{ marginBottom: "20px", fontSize: "13px", color: "#666", lineHeight: "1.5" }}>
                            <p style={{ margin: 0 }}>
                                Provide your details and a support specialist will call you at the selected time.
                            </p>
                        </div>

                        <div style={{ marginBottom: "20px" }}>
                            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", fontSize: "14px", color: "#333" }}>
                                Brief Summary: (optional)
                            </label>
                            <textarea
                                name="summary"
                                value={callbackData.summary}
                                onChange={handleCallbackChange}
                                placeholder="Briefly describe the issue you need help with..."
                                style={{
                                    width: "100%",
                                    padding: "10px 12px",
                                    border: "1px solid #e0e0e0",
                                    borderRadius: "6px",
                                    fontSize: "14px",
                                    backgroundColor: "#f5f5f5",
                                    fontFamily: "inherit",
                                    resize: "vertical",
                                    minHeight: "80px",
                                }}
                            />
                        </div>

                        <div style={{ display: "flex", gap: "12px" }}>
                            <button
                                type="button"
                                onClick={handleCallbackClose}
                                style={{
                                    flex: 1,
                                    padding: "10px 16px",
                                    border: "1px solid #48AAD9",
                                    backgroundColor: "transparent",
                                    color: "#48AAD9",
                                    borderRadius: "6px",
                                    fontSize: "14px",
                                    fontWeight: "500",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease",
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = "#f0f7ff";
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = "transparent";
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                style={{
                                    flex: 1,
                                    padding: "10px 16px",
                                    border: "none",
                                    backgroundColor: "#48AAD9",
                                    color: "white",
                                    borderRadius: "6px",
                                    fontSize: "14px",
                                    fontWeight: "500",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease",
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = "#3a92b8";
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = "#48AAD9";
                                }}
                            >
                                Submit Request
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {showSuccessModal && (
            <div
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 1001,
                }}
            >
                <div
                    style={{
                        backgroundColor: "white",
                        borderRadius: "12px",
                        overflow: "hidden",
                        maxWidth: "420px",
                        width: "90%",
                        padding: "40px 24px",
                        textAlign: "center",
                    }}
                >
                    <div
                        style={{
                            marginBottom: "24px",
                            display: "flex",
                            justifyContent: "center",
                        }}
                    >
                        <img src={successfulIcon} alt="success" style={{ width: "64px", height: "64px" }} />
                    </div>

                    <h2
                        style={{
                            fontSize: "22px",
                            fontWeight: "700",
                            marginBottom: "16px",
                            color: "#1f2937",
                        }}
                    >
                        Ticket Successfully Submitted
                    </h2>

                    <p
                        style={{
                            fontSize: "14px",
                            color: "#666",
                            lineHeight: "1.6",
                            marginBottom: "16px",
                        }}
                    >
                        Your support ticket has been received and added to our queue. We have sent a confirmation email with your ticket details to the user [user email].
                    </p>

                    <div
                        style={{
                            backgroundColor: "#f0f7ff",
                            padding: "12px",
                            borderRadius: "6px",
                            marginBottom: "16px",
                        }}
                    >
                        <p
                            style={{
                                margin: 0,
                                fontSize: "13px",
                                color: "#333",
                                fontWeight: "500",
                            }}
                        >
                            Ticket Reference ID: <strong>{ticketRefId}</strong>
                        </p>
                    </div>

                    <p
                        style={{
                            fontSize: "13px",
                            color: "#666",
                            lineHeight: "1.5",
                            marginBottom: "24px",
                        }}
                    >
                        A support specialist will review your issue and respond shortly, usually within 2 hours.
                    </p>

                    <button
                        onClick={handleSuccessModalClose}
                        style={{
                            width: "100%",
                            padding: "12px 16px",
                            backgroundColor: "#48AAD9",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "14px",
                            fontWeight: "600",
                            cursor: "pointer",
                            transition: "background-color 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = "#3a92b8";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = "#48AAD9";
                        }}
                    >
                        DONE
                    </button>
                </div>
            </div>
        )}
        </>
    );
}

function TroubleShootingView({ onBack }) {
    const [openId, setOpenId] = useState(1);
    const splitIndex = Math.ceil(FAQ_ITEMS.length / 2);
    const leftColumn = useMemo(() => FAQ_ITEMS.slice(0, splitIndex), [splitIndex]);
    const rightColumn = useMemo(() => FAQ_ITEMS.slice(splitIndex), [splitIndex]);

    const toggleFaq = (id) => {
        setOpenId((prev) => (prev === id ? null : id));
    };

    const renderFaqItem = (item) => {
        const isOpen = item.id === openId;

        return (
            <article key={item.id} className={`tech-help-faq-card${isOpen ? " open" : ""}`}>
                <button
                    type="button"
                    className="tech-help-faq-header"
                    onClick={() => toggleFaq(item.id)}
                    aria-expanded={isOpen}
                >
                    <span>{item.question}</span>
                    <span className="tech-help-faq-symbol">{isOpen ? "-" : "+"}</span>
                </button>
                {isOpen && <p className="tech-help-faq-answer mb-0">{item.answer}</p>}
            </article>
        );
    };

    return (
        <section className="dashboard-page tech-help-page">
            <button type="button" className="btn btn-link p-0 tech-help-back-link" onClick={onBack}>
                <i className="fa-solid fa-arrow-left me-2" aria-hidden="true" />
                Back to Technical Support Center
            </button>

            <h4 className="fw-bold mt-2 mb-4 admin-page-title">
                Troubleshooting Guide
            </h4>

            <header className="text-center mb-4">
                <h5 className="fw-bold mb-1 tech-help-faq-title" style={{ color: "#111827" }}>
                    Frequently Asked Questions
                </h5>
                <p className="mb-0 text-muted" style={{ fontSize: 14 }}>
                    Find quick answers to common technical concerns.
                </p>
            </header>

            <div className="row g-4 tech-help-faq-grid-wrap">
                <div className="col-12 col-xl-6 d-flex flex-column gap-3">
                    {leftColumn.map(renderFaqItem)}
                </div>
                <div className="col-12 col-xl-6 d-flex flex-column gap-3">
                    {rightColumn.map(renderFaqItem)}
                </div>
            </div>
        </section>
    );
}

function GetTechnicalHelp() {
    const [view, setView] = useState("home");

    if (view === "contact") {
        return <ContactSupportView onBack={() => setView("home")} />;
    }

    if (view === "troubleshoot") {
        return <TroubleShootingView onBack={() => setView("home")} />;
    }

    return <SupportHome onNavigate={setView} />;
}

export default GetTechnicalHelp;
