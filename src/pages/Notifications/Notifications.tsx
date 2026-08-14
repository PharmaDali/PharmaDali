import React, { useState } from "react";

export interface NotificationItem {
    id: number
    title: string
    message: string
    details?: string
    timestamp: string
    type: 'Alert' | 'System' | 'Ticket' | 'Pharmacy'
    read: boolean
    sender?: string
    referenceId?: string
    module?: string
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
    {
        id: 1,
        title: 'New Pharmacy Registration Request',
        message: 'Landicho Drugstore submitted registration details for approval.',
        details: 'Landicho Drugstore located at Lipa City has completed their registration application. Please review their submitted business permits, FDA licenses, and assigned branch manager information.',
        timestamp: '10 mins ago',
        type: 'Pharmacy',
        read: false,
        sender: 'Pharmacy Verification Service',
        referenceId: 'PHARM-2026-089',
        module: 'Pharmacy Operations',
    },
    {
        id: 2,
        title: 'Critical Ticket Escalated',
        message: 'Ticket #TK-1042 (POS Sync Delay) requires urgent super-admin review.',
        details: 'Ticket #TK-1042 has been automatically escalated due to high SLA waiting time. POS database synchronization failed for 3 active branches in Tanauan City.',
        timestamp: '45 mins ago',
        type: 'Ticket',
        read: false,
        sender: 'Support Escalation Bot',
        referenceId: 'TK-1042',
        module: 'Helpdesk & Support',
    },
    {
        id: 3,
        title: 'System Maintenance Scheduled',
        message: 'Scheduled maintenance is set for Sunday at 02:00 AM UTC.',
        details: 'Super-Admin cloud infrastructure will undergo database index optimizations and system patch upgrades. Brief service degradation may occur for up to 15 minutes.',
        timestamp: '2 hours ago',
        type: 'System',
        read: true,
        sender: 'Infrastructure Team',
        referenceId: 'SYS-MAINT-402',
        module: 'System Security & Maintenance',
    },
    {
        id: 4,
        title: 'High License Renewal Warning',
        message: 'Puremed Pharmacy license expires in 5 days.',
        details: 'Operating license for Puremed Pharmacy (Tanauan City) is approaching expiry on August 18, 2026. Automated reminder has been sent to branch manager Althea Alvarez.',
        timestamp: '1 day ago',
        type: 'Alert',
        read: true,
        sender: 'License Manager System',
        referenceId: 'LIC-78912',
        module: 'Compliance & Licensing',
    },
]

const Notifications: React.FC = () => {
    const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
    const [filter, setFilter] = useState<'All' | 'Unread'>('All');
    const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<'ALL' | number | null>(null);

    const handleSelectNotification = (item: NotificationItem) => {
        setSelectedNotification(item);
        if (!item.read) {
            handleMarkAsRead(item.id);
        }
    };

    const handleMarkAsRead = (id: number) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
        if (selectedNotification?.id === id) {
            setSelectedNotification((prev) => (prev ? { ...prev, read: true } : null));
        }
    };

    const handleToggleReadStatus = (id: number, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
        );
        if (selectedNotification?.id === id) {
            setSelectedNotification((prev) => (prev ? { ...prev, read: !prev.read } : null));
        }
    };

    const handleRequestDelete = (target: 'ALL' | number, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setDeleteTarget(target);
    };

    const handleConfirmDelete = () => {
        if (deleteTarget === 'ALL') {
            setNotifications([]);
            setSelectedNotification(null);
        } else if (typeof deleteTarget === 'number') {
            setNotifications((prev) => prev.filter((n) => n.id !== deleteTarget));
            if (selectedNotification?.id === deleteTarget) {
                setSelectedNotification(null);
            }
        }
        setDeleteTarget(null);
    };

    const handleMarkAllRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        if (selectedNotification) {
            setSelectedNotification((prev) => (prev ? { ...prev, read: true } : null));
        }
    };

    const filtered = notifications.filter((n) => (filter === 'Unread' ? !n.read : true));
    const unreadCount = notifications.filter((n) => !n.read).length;

    // Fullscreen View Mode for selected notification
    if (selectedNotification) {
        return (
            <div className="flex flex-col w-full h-full flex-1 min-h-0 text-sm font-[var(--font-primary)] animate-fade-in">
                {/* Navigation Back Header */}
                <div className="mb-6 flex items-center justify-between gap-4">
                    <button
                        onClick={() => setSelectedNotification(null)}
                        className="flex items-center gap-2 bg-[#424754] hover:bg-[#4d5363] text-[#8ccfed] font-semibold text-xs px-4 py-2.5 rounded-[10px] border border-[rgba(255,255,255,0.06)] transition-all cursor-pointer shadow"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12" />
                            <polyline points="12 19 5 12 12 5" />
                        </svg>
                        Back to Notifications
                    </button>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={(e) => handleToggleReadStatus(selectedNotification.id, e)}
                            className={`px-4 py-2 rounded-[10px] text-xs font-semibold border transition-colors cursor-pointer ${selectedNotification.read
                                ? 'border-[#48aad9]/40 text-[#8ccfed] hover:bg-[#48aad9]/10'
                                : 'border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10'
                                }`}
                        >
                            {selectedNotification.read ? 'Mark as unread' : 'Mark as read'}
                        </button>
                        <button
                            onClick={(e) => handleRequestDelete(selectedNotification.id, e)}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold px-4 py-2 rounded-[10px] transition-colors cursor-pointer"
                        >
                            Delete
                        </button>
                    </div>
                </div>

                {/* Fullscreen Notification Body Container */}
                <div className="w-full max-w-[1400px]">
                    <div className="bg-[#424754] rounded-[20px] p-6 md:p-9 shadow-xl border border-[rgba(255,255,255,0.05)] flex flex-col gap-6">
                        {/* Header Details */}
                        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[rgba(255,255,255,0.08)]">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-3">
                                    <span
                                        className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${selectedNotification.type === 'Alert'
                                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                            : selectedNotification.type === 'Ticket'
                                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                                : selectedNotification.type === 'Pharmacy'
                                                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                            }`}
                                    >
                                        {selectedNotification.type}
                                    </span>
                                    <span className="text-gray-400 text-sm font-medium">{selectedNotification.timestamp}</span>
                                    <span
                                        className={`text-xs font-medium px-2.5 py-0.5 rounded-md ${selectedNotification.read ? 'text-gray-400 bg-gray-600/30' : 'text-[#48aad9] bg-[#48aad9]/10'
                                            }`}
                                    >
                                        {selectedNotification.read ? 'Read' : 'Unread'}
                                    </span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wide m-0">
                                    {selectedNotification.title}
                                </h1>
                            </div>
                        </div>

                        {/* Detailed Description */}
                        <div className="bg-[#353a45] rounded-[16px] p-6 border border-[rgba(255,255,255,0.04)]">
                            <h3 className="text-[#8ccfed] text-xs font-bold uppercase tracking-wider mb-3">
                                Full Message & Details
                            </h3>
                            <p className="text-gray-100 text-base md:text-lg leading-relaxed m-0">
                                {selectedNotification.details || selectedNotification.message}
                            </p>
                        </div>

                        {/* Metadata Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-[#353a45] p-5 rounded-[14px] border border-[rgba(255,255,255,0.04)]">
                                <span className="text-gray-400 text-xs block mb-1">Source / Sender</span>
                                <span className="text-white font-semibold text-sm md:text-base">{selectedNotification.sender || 'System'}</span>
                            </div>
                            <div className="bg-[#353a45] p-5 rounded-[14px] border border-[rgba(255,255,255,0.04)]">
                                <span className="text-gray-400 text-xs block mb-1">Module / Service</span>
                                <span className="text-white font-semibold text-sm md:text-base">{selectedNotification.module || 'Super-Admin Core'}</span>
                            </div>
                            <div className="bg-[#353a45] p-5 rounded-[14px] border border-[rgba(255,255,255,0.04)]">
                                <span className="text-gray-400 text-xs block mb-1">Reference Code</span>
                                <span className="text-[#8ccfed] font-mono font-semibold text-sm md:text-base">{selectedNotification.referenceId || `#NT-${selectedNotification.id}`}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Delete Confirmation Modal */}
                {deleteTarget !== null && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 animate-fade-in">
                        <div className="bg-[#2b2f3a] border border-[rgba(255,255,255,0.08)] rounded-[16px] p-7 w-full max-w-[420px] shadow-2xl text-white">
                            <div className="flex flex-col items-center text-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-1">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                        <line x1="10" y1="11" x2="10" y2="17"></line>
                                        <line x1="14" y1="11" x2="14" y2="17"></line>
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-white m-0">Confirm Deletion</h3>
                                <p className="text-gray-300 text-xs leading-relaxed m-0">
                                    {deleteTarget === 'ALL' ? (
                                        <>
                                            Are you sure you want to delete all notifications?
                                            <br />
                                            This action cannot be undone.
                                        </>
                                    ) : (
                                        'Are you sure you want to delete this notification?'
                                    )}
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setDeleteTarget(null)}
                                    className="flex-1 border border-gray-600 hover:bg-gray-700 text-gray-200 font-medium py-2.5 rounded-[10px] transition-colors cursor-pointer text-xs"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmDelete}
                                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2.5 rounded-[10px] transition-colors cursor-pointer text-xs shadow"
                                >
                                    {deleteTarget === 'ALL' ? 'Delete All' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

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
                            className={`px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-colors cursor-pointer ${filter === 'All' ? 'bg-[#48aad9] text-white' : 'text-gray-300 hover:text-white'
                                }`}
                        >
                            All ({notifications.length})
                        </button>
                        <button
                            onClick={() => setFilter('Unread')}
                            className={`px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-colors cursor-pointer ${filter === 'Unread' ? 'bg-[#48aad9] text-white' : 'text-gray-300 hover:text-white'
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

                    {notifications.length > 0 && (
                        <button
                            onClick={(e) => handleRequestDelete('ALL', e)}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold px-4 py-2 rounded-[10px] transition-colors cursor-pointer shadow"
                        >
                            Delete all
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
                                    onClick={() => handleSelectNotification(item)}
                                    className={`p-4.5 rounded-[14px] border transition-all flex items-start justify-between gap-4 cursor-pointer hover:border-[#48aad9] hover:shadow-lg ${!item.read
                                        ? 'bg-[#3b414f] border-[#48aad9]/50 shadow-md'
                                        : 'bg-[#424754] border-[rgba(255,255,255,0.04)] opacity-90'
                                        }`}
                                >
                                    <div className="flex items-start gap-3.5">
                                        <div
                                            className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${!item.read ? 'bg-[#48aad9]' : 'bg-transparent border border-gray-500'
                                                }`}
                                        />
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-white font-semibold text-sm">{item.title}</span>
                                                <span
                                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${item.type === 'Alert'
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
                                        <button
                                            onClick={(e) => handleToggleReadStatus(item.id, e)}
                                            className={`text-xs px-2.5 py-1 rounded transition-colors cursor-pointer border ${item.read
                                                ? 'border-gray-500/40 text-gray-300 hover:bg-gray-500/10'
                                                : 'border-[#48aad9]/40 text-[#8ccfed] hover:bg-[#48aad9]/10'
                                                }`}
                                        >
                                            {item.read ? 'Mark as unread' : 'Mark as read'}
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

            {/* Delete Confirmation Modal */}
            {deleteTarget !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 animate-fade-in">
                    <div className="bg-[#2b2f3a] border border-[rgba(255,255,255,0.08)] rounded-[16px] p-7 w-full max-w-[420px] shadow-2xl text-white">
                        <div className="flex flex-col items-center text-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-1">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    <line x1="10" y1="11" x2="10" y2="17"></line>
                                    <line x1="14" y1="11" x2="14" y2="17"></line>
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-white m-0">Confirm Deletion</h3>
                            <p className="text-gray-300 text-xs leading-relaxed m-0">
                                {deleteTarget === 'ALL' ? (
                                    <>
                                        Are you sure you want to delete all notifications?
                                        <br />
                                        This action cannot be undone.
                                    </>
                                ) : (
                                    'Are you sure you want to delete this notification?'
                                )}
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="flex-1 border border-gray-600 hover:bg-gray-700 text-gray-200 font-medium py-2.5 rounded-[10px] transition-colors cursor-pointer text-xs"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2.5 rounded-[10px] transition-colors cursor-pointer text-xs shadow"
                            >
                                {deleteTarget === 'ALL' ? 'Delete All' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Notifications;