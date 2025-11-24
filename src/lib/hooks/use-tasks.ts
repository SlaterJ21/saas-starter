import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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

// Update task status with cache invalidation
export function useUpdateTaskStatusMutation(orgId: string | null) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ taskId, status }: { taskId: string; status: string }) => {
            const response = await fetch(`/api/tasks/${taskId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update task');
            }

            const data = await response.json();
            return { taskId, status, data };
        },
        onMutate: async ({ taskId, status }) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['tasks', orgId] });

            // Snapshot the previous value
            const previousTasks = queryClient.getQueryData<Task[]>(['tasks', orgId]);

            // Optimistically update to the new value
            queryClient.setQueryData<Task[]>(['tasks', orgId], (old) => {
                if (!old) return old;
                return old.map((task) =>
                    task.id === taskId ? { ...task, status: status as Task['status'] } : task
                );
            });

            // Return context with the snapshot
            return { previousTasks };
        },
        onError: (err, variables, context) => {
            // If the mutation fails, use the context returned from onMutate to roll back
            if (context?.previousTasks) {
                queryClient.setQueryData(['tasks', orgId], context.previousTasks);
            }
        },
        onSuccess: (data) => {
            // Update the cache with the server response
            queryClient.setQueryData<Task[]>(['tasks', orgId], (old) => {
                if (!old) return old;
                return old.map((task) =>
                    task.id === data.taskId
                        ? { ...task, status: data.status as Task['status'] }
                        : task
                );
            });
        },
        onSettled: () => {
            // Always refetch after error or success to ensure we're in sync
            // But use a small delay to ensure DB transaction is committed
            setTimeout(() => {
                queryClient.invalidateQueries({ queryKey: ['tasks', orgId] });
            }, 100);
        },
    });
}
