import React, { useState } from "react";
import dashboardOverviewImg from "../../assets/images/dashboard_overview.png";
import dashboardMobileViewImg from "../../assets/images/dashboard_mobile_view.png";
import dashboardMobileOverview2Img from "../../assets/images/dashboard_mobile_overview_2.png";

const MANUAL_ITEMS = [
    {
        id: 1,
        title: "Getting Started",
        subtitle: "Learn how to use and manage PharmaDali.",
        content: (
            <div className="row g-4 align-items-start">
                <div className="col-12 col-lg-7 tech-help-manual-content-text">
                    <h6 className="fw-bold" style={{ color: "#475569" }}>1.1 Overview</h6>
                    <p style={{ color: "#64748b" }}>
                        PharmaDali is an integrated pharmacy management system that helps pharmacy owners manage daily operations, including sales, pickup orders, inventory, analytics, reports, pharmacist accounts, notifications, and system settings.
                    </p>

                    <h6 className="fw-bold mt-4" style={{ color: "#475569" }}>1.2 Logging In</h6>
                    <ol className="tech-help-manual-list" style={{ color: "#64748b" }}>
                        <li>Open the PharmaDali application.</li>
                        <li>Enter your registered email address and password.</li>
                        <li>Click Login.</li>
                        <li>You will be directed to the Dashboard.</li>
                    </ol>

                    <h6 className="fw-bold mt-4" style={{ color: "#475569" }}>1.3 Dashboard Overview</h6>
                    <p style={{ color: "#64748b", marginBottom: "8px" }}>The Dashboard provides an overview of your pharmacy's current performance and activities.</p>
                    <ol className="tech-help-manual-list" style={{ color: "#64748b" }}>
                        <li>Summary Cards - View important business information at a glance.</li>
                        <li>Sales Overview - Monitor sales performance over a selected period.</li>
                    </ol>

                    {/* Mobile Only Dashboard Images */}
                    <div className="row g-3 mt-3 d-flex d-lg-none justify-content-center">
                        <div className="col-6 text-center">
                            <img src={dashboardMobileViewImg} alt="Dashboard Mobile" className="img-fluid rounded shadow-sm" style={{ border: "1px solid #e2e8f0" }} />
                        </div>
                        <div className="col-6 text-center">
                            <img src={dashboardMobileOverview2Img} alt="Dashboard Mobile 2" className="img-fluid rounded shadow-sm" style={{ border: "1px solid #e2e8f0" }} />
                        </div>
                    </div>
                </div>
                <div className="col-12 col-lg-5 d-none d-lg-block text-center">
                    <img src={dashboardOverviewImg} alt="Dashboard Overview" className="img-fluid rounded shadow-sm" style={{ objectFit: "contain", border: "1px solid #e2e8f0" }} />
                </div>
            </div>
        )
    },
    {
        id: 2,
        title: "POS",
        subtitle: "Learn how to process sales and transactions using the Point of Sale system.",
        content: <p style={{ color: "#64748b", margin: 0 }}>Content coming soon...</p>
    },
    {
        id: 3,
        title: "Pickup Orders",
        subtitle: "Learn how to manage and process customer pickup orders.",
        content: <p style={{ color: "#64748b", margin: 0 }}>Content coming soon...</p>
    },
    {
        id: 4,
        title: "Inventory",
        subtitle: "Learn how to manage products, stock, and inventory information.",
        content: <p style={{ color: "#64748b", margin: 0 }}>Content coming soon...</p>
    },
    {
        id: 5,
        title: "AI Analytics & Forecasting",
        subtitle: "Learn how to use analytics and forecasting to support pharmacy decision-making.",
        content: <p style={{ color: "#64748b", margin: 0 }}>Content coming soon...</p>
    }
];

function UserManual({ setView }) {
    const [openManualId, setOpenManualId] = useState(1);

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
                    <span className="admin-page-title">User Manual</span>
                </h4>
                <p className="admin-page-subtitle mb-0">
                    Learn and explore the key features to get the most out of the system.
                </p>
            </header>

            <div className="tech-help-manual-container bg-white rounded p-4 shadow-sm border" style={{ borderRadius: "12px" }}>
                {MANUAL_ITEMS.map((item, index) => {
                    const isOpen = item.id === openManualId;
                    const isLast = index === MANUAL_ITEMS.length - 1;
                    return (
                        <div key={item.id} className={`tech-help-manual-item ${!isLast ? 'border-bottom' : ''} py-3`}>
                            <div 
                                className="d-flex justify-content-between align-items-start" 
                                style={{ cursor: "pointer" }}
                                onClick={() => setOpenManualId(isOpen ? null : item.id)}
                            >
                                <div className="d-flex gap-3">
                                    <div 
                                        className="tech-help-manual-number text-white fw-bold d-flex align-items-center justify-content-center rounded"
                                        style={{ backgroundColor: "#2aabe2", width: "24px", height: "24px", minWidth: "24px", fontSize: "14px" }}
                                    >
                                        {item.id}
                                    </div>
                                    <div>
                                        <h5 className="fw-bold mb-1" style={{ color: "#2aabe2", fontSize: "16px" }}>{item.title}</h5>
                                        <p className="text-muted mb-0" style={{ fontSize: "13px" }}>{item.subtitle}</p>
                                    </div>
                                </div>
                                <div className="pt-1">
                                    <i className={`fa-solid ${isOpen ? "fa-chevron-up" : "fa-chevron-down"}`} style={{ color: "#2aabe2", fontSize: "14px" }}></i>
                                </div>
                            </div>
                            {isOpen && (
                                <div className="mt-4 p-4 rounded-3" style={{ backgroundColor: "#f4f7fc" }}>
                                    {item.content}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

export default UserManual;
