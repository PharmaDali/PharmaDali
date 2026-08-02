import { useState, useEffect, useCallback, useRef } from "react";
import Echo from "laravel-echo";
import Pusher from "pusher-js";
import {
  fetchUnreadNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../services/notificationService";

const REVERB_APP_KEY = import.meta.env.VITE_REVERB_APP_KEY || "pharmadali-local-key";
const REVERB_HOST = import.meta.env.VITE_REVERB_HOST || "127.0.0.1";
const REVERB_PORT = import.meta.env.VITE_REVERB_PORT || 8080;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

/**
 * Custom hook that manages real-time admin notifications.
 *
 * - Fetches initial unread notifications via REST.
 * - Subscribes to the private Laravel Reverb broadcast channel.
 * - Exposes mark-as-read and delete actions.
 */
export const useNotifications = () => {
  const [unreadNotifications, setUnreadNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const echoRef = useRef(null);

  const loadUnread = useCallback(async () => {
    try {
      const res = await fetchUnreadNotifications();
      setUnreadNotifications(res?.data ?? []);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadUnread();
  }, [loadUnread]);

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
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      },
    });

    echoRef.current = echo;

    // Each user has a private channel — Laravel broadcasts notifications here
    const userId = localStorage.getItem("user_id");
    if (userId) {
      echo.private(`App.Models.User.${userId}`)
        .notification((notification) => {
          // Prepend real-time notification to the list
          setUnreadNotifications((prev) => [notification, ...prev]);
        });
    }

    return () => {
      echo.disconnect();
    };
  }, []);

  const handleMarkAsRead = useCallback(async (id) => {
    try {
      await markNotificationAsRead(id);
      setUnreadNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  }, []);

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await markAllNotificationsAsRead();
      setUnreadNotifications([]);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  }, []);

  const handleDelete = useCallback(async (id) => {
    try {
      await deleteNotification(id);
      setUnreadNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  }, []);

  return {
    unreadNotifications,
    unreadCount: unreadNotifications.length,
    loading,
    reload: loadUnread,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    deleteNotification: handleDelete,
  };
};
