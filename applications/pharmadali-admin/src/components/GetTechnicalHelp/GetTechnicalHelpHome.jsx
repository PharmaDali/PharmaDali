import React, { useMemo, useState } from "react";
import userManualIcon from "../../assets/icons/help-icons/user-manual.svg";
import reportIssueIcon from "../../assets/icons/help-icons/report-an-issue.svg";

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

function GetTechnicalHelpHome({ setView }) {
    const [openFaqId, setOpenFaqId] = useState(1);

    const splitIndex = Math.ceil(FAQ_ITEMS.length / 2);
    const leftColumn = useMemo(() => FAQ_ITEMS.slice(0, splitIndex), [splitIndex]);
    const rightColumn = useMemo(() => FAQ_ITEMS.slice(splitIndex), [splitIndex]);

    const toggleFaq = (id) => {
        setOpenFaqId((prev) => (prev === id ? null : id));
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
            <div className="row g-3 mb-4">
                {/* User Manual Card */}
                <div className="col-12 col-md-6">
                    <article className="tech-help-hero-card h-100 d-flex flex-column justify-content-between">
                        <div>
                            <div className="d-flex align-items-center gap-2 mb-2">
                                <div className="tech-help-icon-wrapper">
                                    <img src={userManualIcon} alt="User Manual Icon" width="20" height="20" />
                                </div>
                                <h5 className="fw-bold tech-help-card-heading mb-0">User Manual</h5>
                            </div>
                            <p className="tech-help-card-text text-muted mb-2">
                                Learn and explore the key features to get the most out of the system.
                            </p>
                            <button
                                type="button"
                                className="btn btn-link p-0 tech-help-learn-more-link"
                                onClick={() => setView("manual")}
                            >
                                Learn More
                            </button>
                        </div>
                    </article>
                </div>

                {/* Contact Support Card */}
                <div className="col-12 col-md-6">
                    <article className="tech-help-hero-card h-100 d-flex flex-column justify-content-between">
                        <div>
                            <div className="d-flex align-items-center gap-2 mb-2">
                                <div className="tech-help-icon-wrapper">
                                    <img src={reportIssueIcon} alt="Contact Support Icon" width="20" height="20" />
                                </div>
                                <h5 className="fw-bold tech-help-card-heading mb-0">Contact Support</h5>
                            </div>
                            <p className="tech-help-card-text text-muted mb-2">
                                Access assistance for troubleshooting, feature use, and other technical concerns.
                            </p>
                            <button
                                type="button"
                                className="btn btn-link p-0 tech-help-learn-more-link"
                                onClick={() => setView("contact")}
                            >
                                Learn More
                            </button>
                        </div>
                    </article>
                </div>
            </div>

            {/* Frequently Asked Question Section */}
            <article className="tech-help-faq-section-card p-4 mb-4">
                <div className="mb-4">
                    <h4 className="fw-bold tech-help-faq-main-title mb-2">Frequently Asked Question</h4>
                    <p className="tech-help-faq-subtitle text-muted mb-1">
                        Everything you need to know about PharmaDali. Can't find the answer you're looking for?
                    </p>
                    <p className="tech-help-faq-subtitle text-muted mb-0">
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

export default GetTechnicalHelpHome;
