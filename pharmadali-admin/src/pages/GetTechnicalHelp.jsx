import { useMemo, useState } from "react";
import "../assets/css/get-technical-help.css";

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
            <h4 className="fw-bold mb-1" style={{ color: "#2aabe2" }}>
                Technical Support Center
            </h4>
            <p className="text-muted mb-3" style={{ fontSize: 13 }}>
                Search for guides, quick fixes, and direct support channels
            </p>

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

    const handleSubmit = (event) => {
        event.preventDefault();
        setSubmitted(true);
    };

    return (
        <section className="dashboard-page tech-help-page">
            <button type="button" className="btn btn-link p-0 tech-help-back-link" onClick={onBack}>
                <i className="fa-solid fa-arrow-left me-2" aria-hidden="true" />
                Back to Technical Support Center
            </button>

            <h4 className="fw-bold mt-2 mb-4" style={{ color: "#2aabe2" }}>
                Contact Support
            </h4>

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
                                <button type="button" className="btn tech-help-callback-btn">
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

            <h4 className="fw-bold mt-2 mb-4" style={{ color: "#2aabe2" }}>
                Troubleshooting Guide
            </h4>

            <header className="text-center mb-4">
                <h5 className="fw-bold mb-1 tech-help-faq-title" style={{ color: "#111827" }}>
                    Frequently Asked Questions
                </h5>
                <p className="mb-0 text-muted" style={{ fontSize: 14 }}>
                    Find quick answers to common technical concerns
                </p>
            </header>

            <div className="row g-4">
                <div className="col-12 col-xl-6 d-flex flex-column gap-2">
                    {leftColumn.map(renderFaqItem)}
                </div>
                <div className="col-12 col-xl-6 d-flex flex-column gap-2">
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