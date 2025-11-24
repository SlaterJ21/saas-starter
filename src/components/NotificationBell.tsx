'use client';

import { useState, useRef, useEffect } from 'react';
import { useUnreadCount, useNotifications, useMarkAsRead } from '@/lib/hooks/use-notifications';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface NotificationBellProps {
    userId: string;
}

export default function NotificationBell({ userId }: NotificationBellProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const { data: unreadCount = 0 } = useUnreadCount(userId);
    const { data: notifications = [] } = useNotifications(userId);
    const markAsRead = useMarkAsRead();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNotificationClick = (notificationId: string, link?: string) => {
        markAsRead.mutate({ notificationId, userId });
        setIsOpen(false);

        if (link) {
            window.location.href = link;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
            >
                <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                </svg>

                {/* Badge */}
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border-2 border-gray-200 z-50 max-h-[600px] overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-gray-900">Notifications</h3>
                            {unreadCount > 0 && (
                                <span className="text-sm text-blue-600 font-semibold">
                  {unreadCount} new
                </span>
                            )}
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="overflow-y-auto flex-1">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <svg
                                    className="w-16 h-16 mx-auto text-gray-300 mb-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                    />
                                </svg>
                                <p className="text-gray-500 font-medium">No notifications yet</p>
                                <p className="text-gray-400 text-sm mt-1">
                                    We'll notify you when something happens
                                </p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <button
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification.id, notification.link)}
                                    className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition text-left ${
                                        !notification.is_read ? 'bg-blue-50' : ''
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900 mb-1">
                                                {notification.title}
                                            </p>
                                            <p className="text-sm text-gray-600 mb-2">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {formatDistanceToNow(new Date(notification.created_at), {
                                                    addSuffix: true,
                                                })}
                                            </p>
                                        </div>

                                        {!notification.is_read && (
                                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                                        )}
                                    </div>
                                </button>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="p-3 border-t border-gray-200 bg-gray-50">
                            <Link
                                href="/notifications"
                                className="block text-center text-sm text-blue-600 hover:text-blue-700 font-semibold"
                                onClick={() => setIsOpen(false)}
                            >
                                View all notifications
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}