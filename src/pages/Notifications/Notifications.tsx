import React, { useState } from "react";

export interface NotificationItem {
    id: number
    title: string
    message: string
    timestamp: string
    type: 'Alert' | 'System' | 'Ticket' | 'Pharmacy'
    read: boolean
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
    {
        id: 1,
        title: 'New Pharmacy Registration Request',
        message: 'Landicho Drugstore submitted registration details for approval.',
        timestamp: '10 mins ago',
        type: 'Pharmacy',
        read: false,
    },
    {
        id: 2,
        title: 'Critical Ticket Escalated',
        message: 'Ticket #TK-1042 (POS Sync Delay) requires urgent super-admin review.',
        timestamp: '45 mins ago',
        type: 'Ticket',
        read: false,
    },
    {
        id: 3,
        title: 'System Maintenance Scheduled',
        message: 'Scheduled maintenance is set for Sunday at 02:00 AM UTC.',
        timestamp: '2 hours ago',
        type: 'System',
        read: true,
    },
    {
        id: 4,
        title: 'High License Renewal Warning',
        message: 'Puremed Pharmacy license expires in 5 days.',
        timestamp: '1 day ago',
        type: 'Alert',
        read: true,
    },
]

const Notifications: React.FC = () => {
    const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
    const [filter, setFilter] = useState<'All' | 'Unread'>('All');

    const handleMarkAsRead = (id: number) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
    };

    const handleClear = (id: number) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    const handleMarkAllRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    const filtered = notifications.filter((n) => (filter === 'Unread' ? !n.read : true));
    const unreadCount = notifications.filter((n) => !n.read).length;

    return (
        <div className="flex flex-col w-full h-full flex-1 min-h-0 text-sm font-[var(--font-primary)]">
            {/* Header Title & Controls */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="m-0 text-[clamp(1.8rem,3vw,2.6rem)] font-regular text-white tracking-wide">
                        Notifications
                    </h1>
                    <p className="text-[#8ccfed] text-xs mt-1">
                        {unreadCount > 0
                            ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                            : 'All notifications read'}
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="bg-[#424754] p-1 rounded-[10px] flex items-center gap-1 border border-[rgba(255,255,255,0.05)]">
                        <button
                            onClick={() => setFilter('All')}
                            className={`px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-colors cursor-pointer ${
                                filter === 'All' ? 'bg-[#48aad9] text-white' : 'text-gray-300 hover:text-white'
                            }`}
                        >
                            All ({notifications.length})
                        </button>
                        <button
                            onClick={() => setFilter('Unread')}
                            className={`px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-colors cursor-pointer ${
                                filter === 'Unread' ? 'bg-[#48aad9] text-white' : 'text-gray-300 hover:text-white'
                            }`}
                        >
                            Unread ({unreadCount})
                        </button>
                    </div>

                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            className="bg-[#2aa6e0] hover:bg-[#35b3f0] text-white text-xs font-semibold px-4 py-2 rounded-[10px] transition-colors cursor-pointer shadow"
                        >
                            Mark all as read
                        </button>
                    )}
                </div>
            </div>

            {/* Notifications Cards Container */}
            <div className="w-full">
                <div className="max-w-[1400px]">
                    <div className="grid grid-cols-1 gap-4">
                        {filtered.length > 0 ? (
                            filtered.map((item) => (
                                <div
                                    key={item.id}
                                    className={`p-4 rounded-[14px] border transition-all flex items-start justify-between gap-4 ${
                                        !item.read
                                            ? 'bg-[#3b414f] border-[#48aad9]/50 shadow-md'
                                            : 'bg-[#424754] border-[rgba(255,255,255,0.04)] opacity-90'
                                    }`}
                                >
                                    <div className="flex items-start gap-3.5">
                                        <div
                                            className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                                                !item.read ? 'bg-[#48aad9]' : 'bg-transparent border border-gray-500'
                                            }`}
                                        />
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-white font-semibold text-sm">{item.title}</span>
                                                <span
                                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                                        item.type === 'Alert'
                                                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                                            : item.type === 'Ticket'
                                                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                                            : item.type === 'Pharmacy'
                                                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                                    }`}
                                                >
                                                    {item.type}
                                                </span>
                                            </div>
                                            <p className="m-0 text-gray-300 text-xs leading-relaxed">{item.message}</p>
                                            <span className="text-gray-400 text-[11px] mt-1">{item.timestamp}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        {!item.read && (
                                            <button
                                                onClick={() => handleMarkAsRead(item.id)}
                                                className="text-xs text-[#8ccfed] hover:underline px-2.5 py-1 rounded bg-[#48aad9]/10 cursor-pointer"
                                            >
                                                Mark read
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleClear(item.id)}
                                            className="text-gray-400 hover:text-red-400 transition-colors p-1 cursor-pointer"
                                            title="Dismiss notification"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="18" y1="6" x2="6" y2="18" />
                                                <line x1="6" y1="6" x2="18" y2="18" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-[#424754] rounded-[14px] p-8 text-center text-gray-400 text-xs border border-[rgba(255,255,255,0.04)]">
                                No notifications to display.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Notifications;