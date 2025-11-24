import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Notification {
    id: string;
    user_id: string;
    organization_id: string;
    type: string;
    title: string;
    message: string;
    link?: string;
    is_read: boolean;
    created_at: string;
    created_by?: string;
    created_by_name?: string;
    created_by_avatar?: string;
    metadata?: any;
}

export function useNotifications(userId: string | null) {
    return useQuery<Notification[]>({
        queryKey: ['notifications', userId],
        queryFn: async () => {
            if (!userId) return [];

            const response = await fetch(`/api/notifications?userId=${userId}`);
            if (!response.ok) throw new Error('Failed to fetch notifications');
            return response.json();
        },
        enabled: !!userId,
        refetchInterval: 30000, // Poll every 30 seconds
        staleTime: 10000, // Consider stale after 10 seconds
    });
}

export function useUnreadCount(userId: string | null) {
    return useQuery<number>({
        queryKey: ['notifications', 'unread-count', userId],
        queryFn: async () => {
            if (!userId) return 0;

            const response = await fetch(`/api/notifications/unread-count?userId=${userId}`);
            if (!response.ok) throw new Error('Failed to fetch count');
            const data = await response.json();
            return data.count;
        },
        enabled: !!userId,
        refetchInterval: 30000, // Poll every 30 seconds
    });
}

export function useMarkAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ notificationId, userId }: { notificationId: string; userId: string }) => {
            const response = await fetch(`/api/notifications/${notificationId}/read`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
            });

            if (!response.ok) throw new Error('Failed to mark as read');
            return response.json();
        },
        onSuccess: (data, variables) => {
            // Update notifications list
            queryClient.setQueryData<Notification[]>(
                ['notifications', variables.userId],
                (old) => {
                    if (!old) return old;
                    return old.map((n) =>
                        n.id === variables.notificationId ? { ...n, is_read: true } : n
                    );
                }
            );

            // Update unread count
            queryClient.invalidateQueries({
                queryKey: ['notifications', 'unread-count', variables.userId]
            });
        },
    });
}

export function useMarkAllAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (userId: string) => {
            const response = await fetch(`/api/notifications/mark-all-read`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
            });

            if (!response.ok) throw new Error('Failed to mark all as read');
            return response.json();
        },
        onSuccess: (data, userId) => {
            // Update all notifications to read
            queryClient.setQueryData<Notification[]>(
                ['notifications', userId],
                (old) => {
                    if (!old) return old;
                    return old.map((n) => ({ ...n, is_read: true }));
                }
            );

            // Update unread count to 0
            queryClient.setQueryData(['notifications', 'unread-count', userId], 0);
        },
    });
}