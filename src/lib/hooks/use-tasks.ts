import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Fetch tasks for an organization
export function useTasks(orgId: string | null) {
    return useQuery({
        queryKey: ['tasks', orgId],
        queryFn: async () => {
            if (!orgId) return [];

            const response = await fetch(`/api/tasks?orgId=${orgId}`);
            if (!response.ok) throw new Error('Failed to fetch tasks');
            return response.json();
        },
        enabled: !!orgId, // Only run if orgId exists
        staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
    });
}

// Fetch tasks by status for Kanban view
export function useTasksByStatus(orgId: string | null) {
    const { data: tasks = [], ...rest } = useTasks(orgId);

    const tasksByStatus = {
        todo: tasks.filter((t: any) => t.status === 'todo'),
        in_progress: tasks.filter((t: any) => t.status === 'in_progress'),
        done: tasks.filter((t: any) => t.status === 'done'),
    };

    return { data: tasksByStatus, tasks, ...rest };
}

// Update task status with optimistic update
export function useUpdateTaskStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ taskId, status }: { taskId: string; status: string }) => {
            const response = await fetch(`/api/tasks/${taskId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });

            if (!response.ok) throw new Error('Failed to update task');
            return response.json();
        },
        onMutate: async ({ taskId, status }) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['tasks'] });

            // Snapshot previous value
            const previousTasks = queryClient.getQueryData(['tasks']);

            // Optimistically update
            queryClient.setQueryData(['tasks'], (old: any) => {
                if (!old) return old;
                return old.map((task: any) =>
                    task.id === taskId ? { ...task, status } : task
                );
            });

            return { previousTasks };
        },
        onError: (err, variables, context) => {
            // Rollback on error
            if (context?.previousTasks) {
                queryClient.setQueryData(['tasks'], context.previousTasks);
            }
        },
        onSettled: () => {
            // Refetch to ensure sync
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
    });
}