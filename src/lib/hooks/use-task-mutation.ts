import { useQueryClient } from '@tanstack/react-query';
import { updateTaskStatus as serverUpdateTaskStatus } from '@/app/actions/task';

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

export function useTaskStatusUpdate(orgId: string | null) {
    const queryClient = useQueryClient();

    const updateStatus = async (taskId: string, newStatus: string) => {
        // Get current tasks
        const currentTasks = queryClient.getQueryData<Task[]>(['tasks', orgId]);

        if (!currentTasks) {
            throw new Error('No tasks in cache');
        }

        // Find the task being updated
        const taskToUpdate = currentTasks.find(t => t.id === taskId);
        const oldStatus = taskToUpdate?.status;

        // Optimistically update the cache
        const updatedTasks = currentTasks.map((task) =>
            task.id === taskId ? { ...task, status: newStatus as Task['status'] } : task
        );

        queryClient.setQueryData(['tasks', orgId], updatedTasks);

        try {
            // Call server action
            const result = await serverUpdateTaskStatus(taskId, newStatus);

            if (!result.success) {
                // Revert on failure
                queryClient.setQueryData(['tasks', orgId], currentTasks);
                throw new Error(result.message);
            }

            // Success - the optimistic update is already in place
            return { success: true, message: result.message };
        } catch (error) {
            // Revert on error
            queryClient.setQueryData(['tasks', orgId], currentTasks);
            throw error;
        }
    };

    return { updateStatus };
}