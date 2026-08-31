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
  { id: "Stocks", label: "Stocks", types: ["Low Stocks", "Shortage Alert"], icon: "" },
  { id: "Expiry Warning", label: "Expiring", types: ["Expiry Warning"], icon: "fa-clock" },
  { id: "System Alert", label: "Alerts", types: ["System Alert"], icon: "fa-circle-info" },
];

export function useNotificationsPage() {
  const { notifications } = useOutletContext();
  const { unreadNotifications = [], unreadCount = 0, loading, markAsRead, markAllAsRead, deleteNotification, deleteAllNotifications } = notifications;

  const [activeTab, setActiveTab] = useState("All");
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);

  const paginatedNotifications = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredNotifications.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredNotifications, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setCurrentPage(1);
    setSelectedNotification(null);
  };

  const visiblePageNumbers = useMemo(() => {
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  }, [currentPage, totalPages]);

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
    paginatedNotifications,
    currentPage,
    totalPages,
    visiblePageNumbers,
    handlePageChange,
    handleTabChange,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  };
}

export default useNotificationsPage;
