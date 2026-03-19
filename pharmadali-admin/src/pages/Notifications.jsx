import { useMemo, useState } from "react";

const notificationsData = [
  {
    id: 1,
    type: "Low Stocks",
    message: "Only 12 units remaining. This is below your set threshold.",
    dateTime: "Sep. 12, 2026 4:00 PM",
  },
  {
    id: 2,
    type: "Shortage Alert",
    message: "Based on a 15% spike in recent sales, you are",
    dateTime: "Sep. 12, 2026 4:00 PM",
  },
  {
    id: 3,
    type: "Expiry Warning",
    message: "85 units of [Product Name] will expire in 4 days.",
    dateTime: "Sep. 12, 2026 4:00 PM",
  },
  {
    id: 4,
    type: "System Alert",
    message: "14 orders could not be imported due to a conne",
    dateTime: "Sep. 12, 2026 4:00 PM",
  },
  {
    id: 5,
    type: "Low Stocks",
    message: "Only 12 units remaining. This is below your set threshold.",
    dateTime: "Sep. 12, 2026 4:00 PM",
  },
  {
    id: 6,
    type: "Expiry Warning",
    message: "85 units of [Product Name] will expire in 4 days.",
    dateTime: "Sep. 12, 2026 4:00 PM",
  },
];

const typeStyles = {
  "Low Stocks": {
    typeColor: "#48a7e0",
    messageColor: "#48a7e0",
  },
  "Shortage Alert": {
    typeColor: "#ef7d73",
    messageColor: "#ef7d73",
  },
  "Expiry Warning": {
    typeColor: "#eca64f",
    messageColor: "#eca64f",
  },
  "System Alert": {
    typeColor: "#9b9494",
    messageColor: "#9b9494",
  },
};

const tabs = ["Primary", "Stocks", "Expiring", "Shortage", "System Alert"];

function Notifications() {
  const [activeTab, setActiveTab] = useState("Primary");
  const [selectedNotification, setSelectedNotification] = useState(null);

  const filteredNotifications = useMemo(() => {
    if (activeTab === "Primary") {
      return notificationsData;
    }

    const tabTypeMap = {
      Stocks: "Low Stocks",
      Expiring: "Expiry Warning",
      Shortage: "Shortage Alert",
      "System Alert": "System Alert",
    };

    return notificationsData.filter(
      (item) => item.type === tabTypeMap[activeTab]
    );
  }, [activeTab]);

  const getDetailTitle = (type) => {
    const titleMap = {
      "Low Stocks": "Low Stock",
      "Shortage Alert": "Shortage Alert",
      "Expiry Warning": "Expiry Warning",
      "System Alert": "System Alert",
    };

    return `${titleMap[type] || "Notification"}: [Product Name]`;
  };

  const getDetailTheme = (type) => {
    const style = typeStyles[type] || typeStyles["System Alert"];

    const themeMap = {
      "Low Stocks": { bg: "#d2edf8", text: style.typeColor },
      "Shortage Alert": { bg: "#fde3e1", text: style.typeColor },
      "Expiry Warning": { bg: "#fdf0dd", text: style.typeColor },
      "System Alert": { bg: "#eceaea", text: style.typeColor },
    };

    return themeMap[type] || { bg: "#eceaea", text: style.typeColor };
  };

  if (selectedNotification) {
    const detailTheme = getDetailTheme(selectedNotification.type);

    return (
      <div className="p-3 p-md-4">
        <button
          type="button"
          onClick={() => setSelectedNotification(null)}
          style={{
            border: "none",
            background: "transparent",
            padding: 0,
            marginBottom: "16px",
            color: "#23252b",
            fontSize: "28px",
            fontWeight: 700,
            lineHeight: 1,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <i className="fa-solid fa-chevron-left" style={{ fontSize: "14px" }} />
          <span>Notifications</span>
        </button>

        <div
          style={{
            backgroundColor: detailTheme.bg,
            borderRadius: "16px",
            minHeight: "560px",
            padding: "34px 36px",
          }}
        >
          <h2
            style={{
              color: detailTheme.text,
              fontSize: "44px",
              fontWeight: 700,
              lineHeight: 1.15,
              marginBottom: "34px",
            }}
          >
            {getDetailTitle(selectedNotification.type)}
          </h2>

          <p
            style={{
              color: "#23252b",
              fontSize: "36px",
              lineHeight: 1.25,
              maxWidth: "900px",
              marginBottom: "42px",
            }}
          >
            {selectedNotification.message}
          </p>

          <p
            style={{
              color: "#23252b",
              fontSize: "36px",
              lineHeight: 1.2,
              marginBottom: "0",
            }}
          >
            Reorder now!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 p-md-4">
      <h4 className="mb-0" style={{ color: "#3aa7de", fontWeight: 700, fontSize: "28px", lineHeight: 1 }}>
        Notifications
      </h4>
      <div style={{ color: "#2e2e2e", fontSize: "14px", marginBottom: "14px", lineHeight: 1.1 }}>
        Real Time Notifications
      </div>

      <ul
        className="nav nav-tabs"
        style={{
          borderBottom: "2px solid #86878f",
          marginBottom: "6px",
          paddingLeft: 0,
          display: "flex",
          width: "100%",
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab;

          return (
            <li className="nav-item" key={tab} style={{ flex: 1 }}>
              <button
                type="button"
                className="nav-link"
                onClick={() => {
                  setActiveTab(tab);
                  setSelectedNotification(null);
                }}
                style={{
                  border: "none",
                  borderBottom: isActive ? "2px solid #45a9dd" : "2px solid transparent",
                  borderRadius: 0,
                  backgroundColor: "transparent",
                  color: "#23252b",
                  fontSize: "14px",
                  fontWeight: isActive ? 600 : 500,
                  padding: "7px 10px",
                  marginBottom: "-2px",
                  width: "100%",
                  textAlign: "center",
                }}
              >
                {tab === "Primary" && (
                  <i className="fa-regular fa-star me-1" style={{ fontSize: "15px", color: "#24242a" }} />
                )}
                {tab}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="table-responsive">
        <table className="table align-middle mb-0" style={{ fontSize: "16px", borderCollapse: "separate", borderSpacing: "0 8px" }}>
          <thead>
            <tr>
              <th
                style={{
                  width: "38px",
                  border: "none",
                  backgroundColor: "#d7e7ef",
                  borderTopLeftRadius: "9px",
                  borderBottomLeftRadius: "9px",
                }}
              ></th>
              <th style={{ color: "#202329", fontWeight: 700, border: "none", fontSize: "15px", backgroundColor: "#d7e7ef" }}>Type</th>
              <th style={{ color: "#202329", fontWeight: 700, border: "none", fontSize: "15px", backgroundColor: "#d7e7ef" }}>Message</th>
              <th style={{ color: "#202329", fontWeight: 700, border: "none", fontSize: "15px", backgroundColor: "#d7e7ef" }}>Date&Time</th>
              <th
                style={{
                  width: "40px",
                  border: "none",
                  backgroundColor: "#d7e7ef",
                  borderTopRightRadius: "9px",
                  borderBottomRightRadius: "9px",
                }}
              ></th>
            </tr>
          </thead>
          <tbody>
            {filteredNotifications.map((item) => {
              const style = typeStyles[item.type] || typeStyles["System Alert"];

              return (
                <tr key={item.id} onClick={() => setSelectedNotification(item)} style={{ cursor: "pointer" }}>
                  <td
                    style={{
                      backgroundColor: "#f2efef",
                      border: "none",
                      borderTopLeftRadius: "12px",
                      borderBottomLeftRadius: "12px",
                      padding: "9px 10px 9px 14px",
                    }}
                  >
                    <input
                      className="form-check-input"
                      type="checkbox"
                      style={{ borderColor: "#717171" }}
                      onClick={(event) => event.stopPropagation()}
                    />
                  </td>
                  <td style={{ backgroundColor: "#f2efef", border: "none", padding: "9px 8px" }}>
                    <span style={{ color: style.typeColor, fontWeight: 600 }}>{item.type}</span>
                  </td>
                  <td style={{ backgroundColor: "#f2efef", border: "none", padding: "9px 8px" }}>
                    <span
                      style={{
                        color: style.messageColor,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "block",
                        maxWidth: "900px",
                      }}
                    >
                      {item.message}
                    </span>
                  </td>
                  <td style={{ backgroundColor: "#f2efef", border: "none", padding: "9px 8px", whiteSpace: "nowrap" }}>
                    <span style={{ color: style.messageColor }}>{item.dateTime}</span>
                  </td>
                  <td
                    style={{
                      backgroundColor: "#f2efef",
                      border: "none",
                      borderTopRightRadius: "12px",
                      borderBottomRightRadius: "12px",
                      padding: "9px 14px 9px 8px",
                    }}
                  >
                    <i
                      className="fa-regular fa-trash-can"
                      style={{ color: "#2a2a2a", fontSize: "12px" }}
                      onClick={(event) => event.stopPropagation()}
                    />
                  </td>
                </tr>
              );
            })}
            {filteredNotifications.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-4" style={{ color: "#595959", border: "none", fontSize: "12px" }}>
                  No notifications for this category.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Notifications;