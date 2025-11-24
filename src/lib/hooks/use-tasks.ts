import { useQuery } from '@tanstack/react-query';

interface Task {
    id: string;
    title: string;
    description?: string;
    status: 'todo' | 'in_progress' | 'done';
    project_id: string;
    project_name: string;
    assigned_to?: string;
    assigned_to_name?: string;
    created_at: string;
    updated_at: string;
}

// Fetch tasks for an organization
export function useTasks(orgId: string | null) {
    return useQuery<Task[]>({
        queryKey: ['tasks', orgId],
        queryFn: async () => {
            if (!orgId) return [];

            const response = await fetch(`/api/tasks?orgId=${orgId}`);
            if (!response.ok) throw new Error('Failed to fetch tasks');
            return response.json();
        },
        enabled: !!orgId,
        staleTime: 5 * 60 * 1000,
    });
}