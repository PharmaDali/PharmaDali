import { useState, useEffect, useCallback, useRef } from "react";
import Echo from "laravel-echo";
import Pusher from "pusher-js";
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
} from "../services/notificationService";

const REVERB_APP_KEY = import.meta.env.VITE_REVERB_APP_KEY || "pharmadali-local-key";
const REVERB_HOST = import.meta.env.VITE_REVERB_HOST || "127.0.0.1";
const REVERB_PORT = import.meta.env.VITE_REVERB_PORT || 8080;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

/**
 * Custom hook that manages real-time admin notifications.
 *
 * - Fetches notifications via REST.
 * - Subscribes to the private Laravel Reverb broadcast channel.
 * - Preserves read notifications in state (updating read_at instead of deleting).
 * - Exposes mark-as-read and delete actions.
 */
export const useNotifications = () => {
  const [notificationsList, setNotificationsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeToast, setActiveToast] = useState(null);
  const echoRef = useRef(null);

  const loadNotifications = useCallback(async () => {
    try {
      const res = await fetchNotifications();
      setNotificationsList(res?.data ?? []);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Laravel Echo / Reverb WebSocket subscription
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    window.Pusher = Pusher;

    const echo = new Echo({
      broadcaster: "reverb",
      key: REVERB_APP_KEY,
      wsHost: REVERB_HOST,
      wsPort: Number(REVERB_PORT),
      wssPort: Number(REVERB_PORT),
      forceTLS: false,
      enabledTransports: ["ws", "wss"],
      disableStats: true,
      authEndpoint: `${API_BASE_URL.replace(/\/$/, "")}/broadcasting/auth`,
      authorizer: (channel) => ({
        authorize: (socketId, callback) => {
          const currentToken = localStorage.getItem("token");
          fetch(`${API_BASE_URL.replace(/\/$/, "")}/broadcasting/auth`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${currentToken || ""}`,
              Accept: "application/json",
            },
            body: JSON.stringify({
              socket_id: socketId,
              channel_name: channel.name,
            }),
          })
            .then((response) => {
              if (!response.ok) {
                throw new Error(`Broadcast auth failed with status ${response.status}`);
              }
              return response.json();
            })
            .then((data) => callback(false, data))
            .catch((error) => callback(true, error));
        },
      }),
    });

    echoRef.current = echo;

    // Each user has a private channel — Laravel broadcasts notifications here
    const userId = localStorage.getItem("user_id");
    if (userId) {
      echo.private(`App.Models.User.${userId}`)
        .notification((notification) => {
          // Normalize notification type if Laravel sends raw class name in notification.type
          const rawType = notification.type;
          const data = notification.data || notification;
          const resolvedType =
            (typeof rawType === "string" && rawType.includes("\\"))
              ? (data.type || notification.alertType || "System Alert")
              : (rawType || data.type || "System Alert");

          const normalized = {
            id: notification.id || String(Date.now()),
            type: resolvedType,
            message: notification.message || data.message || "",
            dateTime: notification.dateTime || data.dateTime || new Date().toLocaleString(),
            read_at: null,
            data: data,
          };

          // Prepend real-time notification to the list & trigger toast popup
          setNotificationsList((prev) => [normalized, ...prev]);
          setActiveToast(normalized);
        });
    }

    return () => {
      echo.disconnect();
    };
  }, []);

  const handleMarkAsRead = useCallback(async (id) => {
    try {
      await markNotificationAsRead(id);
      // Mark as read in state without deleting the notification
      setNotificationsList((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      );
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  }, []);

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await markAllNotificationsAsRead();
      const nowIso = new Date().toISOString();
      setNotificationsList((prev) =>
        prev.map((n) => ({ ...n, read_at: n.read_at || nowIso }))
      );
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  }, []);

  const handleDelete = useCallback(async (id) => {
    try {
      await deleteNotification(id);
      setNotificationsList((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  }, []);

  const handleDeleteAll = useCallback(async () => {
    try {
      await deleteAllNotifications();
      setNotificationsList([]);
    } catch (err) {
      console.error("Failed to delete all notifications:", err);
    }
  }, []);

  const clearToast = useCallback(() => {
    setActiveToast(null);
  }, []);

  const unreadCount = notificationsList.filter((n) => !n.read_at).length;

  return {
    notificationsList,
    unreadNotifications: notificationsList, // Expose full list for tab filtering
    unreadCount,
    loading,
    activeToast,
    clearToast,
    reload: loadNotifications,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    deleteNotification: handleDelete,
    deleteAllNotifications: handleDeleteAll,
  };
};
