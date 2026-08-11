import React, { useMemo, useState } from "react";
import "../assets/css/get-technical-help.css";
import userManualIcon from "../assets/icons/help-icons/user-manual.svg";
import reportIssueIcon from "../assets/icons/help-icons/report-an-issue.svg";
import arrowForwardIcon from "../assets/icons/help-icons/arrow_forward.svg";
import successIcon from "../assets/icons/help-icons/success.svg";

// Simple, descriptive, non-technical FAQ content
const FAQ_ITEMS = [
    {
        id: 1,
        question: "What is PharmaDali?",
        answer: "PharmaDali is an easy-to-use pharmacy management system. It helps you handle counter sales, keep track of medicine stocks, manage customer pickup orders, and avoid expired products without any complicated technical steps.",
    },
    {
        id: 2,
        question: "How does the POS (Point of Sale) system work?",
        answer: "Our Cashier POS lets your counter staff select medicines, apply senior citizen or PWD discounts, print or email customer receipts, and automatically update your stock counts in real time as items are sold.",
    },
    {
        id: 3,
        question: "How does the system handle medicine expiry dates?",
        answer: "PharmaDali follows the FEFO (First Expiry, First Out) rule. It automatically alerts you about medicines nearing their expiry date and prioritizes selling older batches first so none of your inventory goes to waste.",
    },
    {
        id: 4,
        question: "How are customer online pickup orders handled?",
        answer: "When a customer places an order online for store pickup, pharmacists get an instant notification to review and prepare the items. Once ready, the customer is notified to visit your pharmacy to pick up and pay.",
    },
    {
        id: 5,
        question: "How does inventory stay updated?",
        answer: "Every time a medicine is sold at the cashier counter, returned, or restocked, the system automatically updates your stock inventory count across all screens so you always know exactly what is available.",
    },
    {
        id: 6,
        question: "How will I know when to reorder products?",
        answer: "The system sends low stock alerts and automated restock predictions before items run out, giving you an estimated number of remaining supply days so you can reorder from suppliers on time.",
    },
    {
        id: 7,
        question: "How do customer item exchanges work?",
        answer: "If a customer needs to exchange an item within your store return window, staff can select the returned product, pick replacement medicines, and the system automatically calculates any price difference and updates your stock counts.",
    },
    {
        id: 8,
        question: "Can I view sales and store reports?",
        answer: "Yes! You can view clean, easy-to-read daily, weekly, and monthly sales graphs, batch movement histories, and inventory reports anytime with just a single click.",
    },
    {
        id: 9,
        question: "What should I do if I run into a problem or error?",
        answer: "Simply click 'Report an Issue' on this page, fill in a short summary of the issue you encountered, and click submit. Our technical support specialists will review your ticket and assist you shortly.",
    },
    {
        id: 10,
        question: "How do I customize my pharmacy store settings?",
        answer: "You can easily configure your pharmacy's operating hours, VAT rates, and item exchange policies anytime under the Settings page in your admin portal.",
    },
];

function GetTechnicalHelp() {
    const [view, setView] = useState("home"); // "home" | "contact"
    const [openFaqId, setOpenFaqId] = useState(1);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [ticketRefId, setTicketRefId] = useState("");
    const [userEmail, setUserEmail] = useState("user email");
    const [issueSummary, setIssueSummary] = useState("");
    const [issueProblem, setIssueProblem] = useState("");

    const splitIndex = Math.ceil(FAQ_ITEMS.length / 2);
    const leftColumn = useMemo(() => FAQ_ITEMS.slice(0, splitIndex), [splitIndex]);
    const rightColumn = useMemo(() => FAQ_ITEMS.slice(splitIndex), [splitIndex]);

    const toggleFaq = (id) => {
        setOpenFaqId((prev) => (prev === id ? null : id));
    };

    const handleReportSubmit = (e) => {
        e.preventDefault();
        if (!issueSummary.trim() || !issueProblem.trim()) return;

        // Generate Ticket Reference ID
        const refId = "TICK-" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + "-" + Math.floor(1000 + Math.random() * 9000);
        setTicketRefId(refId);

        // Fetch logged in user email if available
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                if (parsed.email) setUserEmail(parsed.email);
            } catch (err) {}
        }

        setShowSuccessModal(true);
    };

    const handleDoneModal = () => {
        setShowSuccessModal(false);
        setIssueSummary("");
        setIssueProblem("");
        setView("home");
    };

    const renderFaqItem = (item) => {
        const isOpen = item.id === openFaqId;

        return (
            <article key={item.id} className={`tech-help-faq-pill ${isOpen ? "open" : ""}`}>
                <button
                    type="button"
                    className="tech-help-faq-header"
                    onClick={() => toggleFaq(item.id)}
                    aria-expanded={isOpen}
                >
                    <span className="tech-help-faq-question">{item.question}</span>
                    <span className="tech-help-faq-symbol">{isOpen ? "-" : "+"}</span>
                </button>
                {isOpen && (
                    <div className="tech-help-faq-body">
                        <p className="mb-0 text-muted">{item.answer}</p>
                    </div>
                )}
            </article>
        );
    };

    // Dedicated Report an Issue View/Page
    if (view === "contact") {
        return (
            <section className="dashboard-page tech-help-page p-4">
                <header className="mb-4">
                    <h2 className="fw-bold mb-1 d-flex align-items-center gap-2 flex-wrap">
                        <span
                            className="tech-help-breadcrumb-parent"
                            onClick={() => setView("home")}
                            role="button"
                            tabIndex={0}
                        >
                            Get Technical Help
                        </span>
                        <i className="fa-solid fa-chevron-right tech-help-breadcrumb-icon" aria-hidden="true" />
                        <span className="tech-help-title">Report an Issue</span>
                    </h2>
                    <p className="tech-help-subtitle mb-0">
                        Access assistance for troubleshooting, feature use, and other technical concerns.
                    </p>
                </header>

                <div className="row g-4">
                    {/* Left Column: Ticket Form */}
                    <div className="col-12 col-xl-8">
                        <article className="card shadow-sm border-0 rounded-4 p-4">
                            <form onSubmit={handleReportSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="issueSummary" className="form-label fw-bold tech-help-soft-black" style={{ fontSize: "14px" }}>
                                        Issue Summary <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        id="issueSummary"
                                        type="text"
                                        className="form-control tech-help-form-input"
                                        placeholder="Brief summary of the issue"
                                        value={issueSummary}
                                        onChange={(e) => setIssueSummary(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="issueProblem" className="form-label fw-bold tech-help-soft-black" style={{ fontSize: "14px" }}>
                                        Describe the Problem <span className="text-danger">*</span>
                                    </label>
                                    <textarea
                                        id="issueProblem"
                                        rows="6"
                                        className="form-control tech-help-form-input tech-help-textarea"
                                        placeholder="Provide details, steps to reproduce, and expected behavior"
                                        value={issueProblem}
                                        onChange={(e) => setIssueProblem(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="d-flex justify-content-start">
                                    <button type="submit" className="btn tech-help-primary-btn px-4 py-2">
                                        Submit Support Ticket
                                    </button>
                                </div>
                            </form>
                        </article>
                    </div>

                    {/* Right Column: Admin & Contact Info */}
                    <div className="col-12 col-xl-4">
                        <article className="card shadow-sm border-0 rounded-4 p-4 h-100">
                            <h5 className="fw-bold mb-4 tech-help-card-heading">Contact Support</h5>

                            <div className="d-flex flex-column gap-4">
                                <div className="d-flex align-items-start gap-3">
                                    <div className="tech-help-icon-wrapper flex-shrink-0">
                                        <i className="fa-solid fa-phone text-white" aria-hidden="true" />
                                    </div>
                                    <div>
                                        <h6 className="fw-bold mb-1 tech-help-soft-black" style={{ fontSize: "14px" }}>Phone Support</h6>
                                        <p className="mb-0 text-muted" style={{ fontSize: "13px" }}>1-8096-905 (Priority Line)</p>
                                    </div>
                                </div>

                                <div className="d-flex align-items-start gap-3">
                                    <div className="tech-help-icon-wrapper flex-shrink-0">
                                        <i className="fa-regular fa-envelope text-white" aria-hidden="true" />
                                    </div>
                                    <div>
                                        <h6 className="fw-bold mb-1 tech-help-soft-black" style={{ fontSize: "14px" }}>Mail Support</h6>
                                        <p className="mb-0 text-muted" style={{ fontSize: "13px" }}>pharmadali@gmail.com</p>
                                    </div>
                                </div>

                                <div className="d-flex align-items-start gap-3">
                                    <div className="tech-help-icon-wrapper flex-shrink-0">
                                        <i className="fa-solid fa-clock text-white" aria-hidden="true" />
                                    </div>
                                    <div>
                                        <h6 className="fw-bold mb-1 tech-help-soft-black" style={{ fontSize: "14px" }}>Support Hours</h6>
                                        <p className="mb-0 text-muted" style={{ fontSize: "13px" }}>8:00 AM - 5:00 PM (PHT)</p>
                                    </div>
                                </div>
                            </div>
                        </article>
                    </div>
                </div>

                {/* Submitted Ticket Success Modal (Matching Image 2 Reference) */}
                {showSuccessModal && (
                    <div className="modal-backdrop-custom" onClick={() => setShowSuccessModal(false)}>
                        <div className="modal-content-custom modal-sm-ticket" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header-gradient">
                                <div></div>
                                <button className="modal-close-btn" onClick={() => setShowSuccessModal(false)}>
                                    ✕
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

    // Main Technical Help Page ("home" view matching Image 1)
    return (
        <section className="dashboard-page tech-help-page p-4">
            {/* Header Section */}
            <header className="mb-4">
                <h2 className="fw-bold mb-1 tech-help-title">Get Technical Help</h2>
                <p className="tech-help-subtitle mb-0">
                    search for solutions or connect with the developers.
                </p>
            </header>

            {/* Top Cards Row */}
            <div className="row g-4 mb-4">
                {/* User Manual Card */}
                <div className="col-12 col-md-6">
                    <article className="tech-help-hero-card h-100 d-flex flex-column justify-content-between">
                        <div>
                            <div className="tech-help-icon-wrapper mb-3">
                                <img src={userManualIcon} alt="User Manual Icon" width="24" height="24" />
                            </div>
                            <h5 className="fw-bold tech-help-card-heading mb-2">User Manual</h5>
                            <p className="tech-help-card-text text-muted mb-4">
                                Learn and explore the key features to get the most out of the system.
                            </p>
                        </div>
                        <div className="d-flex justify-content-end align-items-center">
                            <button
                                type="button"
                                className="tech-help-circle-btn"
                                aria-label="User Manual"
                            >
                                <img src={arrowForwardIcon} alt="Arrow" width="20" height="20" />
                            </button>
                        </div>
                    </article>
                </div>

                {/* Report an Issue Card */}
                <div className="col-12 col-md-6">
                    <article className="tech-help-hero-card h-100 d-flex flex-column justify-content-between">
                        <div>
                            <div className="tech-help-icon-wrapper mb-3">
                                <img src={reportIssueIcon} alt="Report Issue Icon" width="24" height="24" />
                            </div>
                            <h5 className="fw-bold tech-help-card-heading mb-2">Report an Issue</h5>
                            <p className="tech-help-card-text text-muted mb-4">
                                Access assistance for troubleshooting, feature use, and other technical concerns.
                            </p>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                            <button
                                type="button"
                                className="btn btn-link p-0 tech-help-learn-more-link"
                                onClick={() => setView("contact")}
                            >
                                Learn More
                            </button>
                            <button
                                type="button"
                                className="tech-help-circle-btn"
                                onClick={() => setView("contact")}
                                aria-label="Report an Issue"
                            >
                                <img src={arrowForwardIcon} alt="Arrow" width="20" height="20" />
                            </button>
                        </div>
                    </article>
                </div>
            </div>

            {/* Frequently Asked Question Section (Image 1 reference with Previous Version Content) */}
            <article className="tech-help-faq-section-card p-4 mb-4">
                <div className="mb-4">
                    <h4 className="fw-bold tech-help-faq-main-title mb-2">Frequently Asked Question</h4>
                    <p className="text-muted mb-1" style={{ fontSize: "14px" }}>
                        Everything you need to know about PharmaDali. Can't find the answer you're looking for?
                    </p>
                    <p className="text-muted mb-0" style={{ fontSize: "14px" }}>
                        Say hi at{" "}
                        <a href="mailto:pharmadali@gmail.com" className="tech-help-contact-email">
                            pharmadali@gmail.com
                        </a>
                    </p>
                </div>

                {/* 2-Column Accordion Grid */}
                <div className="row g-3">
                    <div className="col-12 col-lg-6 d-flex flex-column gap-3">
                        {leftColumn.map(renderFaqItem)}
                    </div>
                    <div className="col-12 col-lg-6 d-flex flex-column gap-3">
                        {rightColumn.map(renderFaqItem)}
                    </div>
                </div>
            </article>

            {/* System Version Information Footer Card */}
            <article className="tech-help-version-footer-card p-3">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                    <div>
                        <h6 className="fw-bold mb-1 tech-help-version-title">System Version Information</h6>
                        <p className="mb-0 text-muted" style={{ fontSize: "13px" }}>
                            App Version: <strong>v4.2.0 kineme</strong>
                        </p>
                    </div>
                    <div>
                        <p className="mb-0 text-muted" style={{ fontSize: "13px" }}>
                            Last Build: <strong>January 23, 2026</strong>
                        </p>
                    </div>
                </div>
            </article>
        </section>
    );
}

export default GetTechnicalHelp;
