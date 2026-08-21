import { useState, useMemo } from "react";
import { useOutletContext } from "react-router-dom";

export const TYPE_META = {
  "Low Stocks": {
    label: "Stocks",
    fullTitle: "Low Stock Alert",
    color: "#2aabe2",
    bgClass: "alert-badge-stocks",
    icon: "fa-boxes-stacked",
  },
  "Shortage Alert": {
    label: "Stocks",
    fullTitle: "Shortage Forecast",
    color: "#2aabe2",
    bgClass: "alert-badge-stocks",
    icon: "fa-boxes-stacked",
  },
  "Expiry Warning": {
    label: "Expiring",
    fullTitle: "Expiry Notice",
    color: "#f59e0b",
    bgClass: "alert-badge-expiry",
    icon: "fa-clock",
  },
  "System Alert": {
    label: "Alerts",
    fullTitle: "System Alert",
    color: "#6b7280",
    bgClass: "alert-badge-system",
    icon: "fa-circle-info",
  },
};

export const resolveNotificationType = (item) => {
  if (!item) return "System Alert";
  let t = item.type || item.data?.type || "System Alert";
  if (typeof t === "string" && (t.includes("\\") || t.startsWith("App"))) {
    t = item.data?.type || item.alertType || "System Alert";
  }
  return TYPE_META[t] ? t : "System Alert";
};

export const getMeta = (typeKey) => TYPE_META[typeKey] ?? TYPE_META["System Alert"];

export const TAB_CATEGORIES = [
  { id: "All", label: "Primary", types: null, icon: "fa-star" },
  { id: "Stocks", label: "Stocks", types: ["Low Stocks", "Shortage Alert"], icon: "fa-boxes-stacked" },
  { id: "Expiry Warning", label: "Expiring", types: ["Expiry Warning"], icon: "fa-clock" },
  { id: "System Alert", label: "Alerts", types: ["System Alert"], icon: "fa-circle-info" },
];

export function useNotificationsPage() {
  const { notifications } = useOutletContext();
  const { unreadNotifications = [], unreadCount = 0, loading, markAsRead, markAllAsRead, deleteNotification, deleteAllNotifications } = notifications;

  const [activeTab, setActiveTab] = useState("All");
  const [selectedNotification, setSelectedNotification] = useState(null);

  const categoryCounts = useMemo(() => {
    const counts = { All: unreadCount };
    TAB_CATEGORIES.forEach((cat) => {
      if (cat.types) {
        counts[cat.id] = unreadNotifications.filter(
          (n) => !n.read_at && cat.types.includes(resolveNotificationType(n))
        ).length;
      }
    });
    return counts;
  }, [unreadNotifications, unreadCount]);

  const filteredNotifications = useMemo(() => {
    const activeCategory = TAB_CATEGORIES.find((cat) => cat.id === activeTab);
    if (!activeCategory || !activeCategory.types) {
      return unreadNotifications;
    }
    return unreadNotifications.filter(
      (n) => activeCategory.types.includes(resolveNotificationType(n))
    );
  }, [activeTab, unreadNotifications]);

  return {
    unreadNotifications,
    unreadCount,
    loading,
    activeTab,
    setActiveTab,
    selectedNotification,
    setSelectedNotification,
    categoryCounts,
    filteredNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  };
}

export default useNotificationsPage;
