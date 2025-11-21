'use client';

import {useTransition} from 'react';
import {deleteTask} from '@/app/actions/task';
import {toast} from '@/lib/toast';
import {useRouter} from 'next/navigation';

export default function DeleteTaskButton({
                                             taskId,
                                             redirectTo,
                                         }: {
    taskId: string;
    redirectTo?: string;
}) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleDelete = () => {
        if (!confirm('Are you sure you want to delete this task?')) {
            return;
        }

        // Show optimistic toast immediately
        toast.success('Deleting task...');

        startTransition(async () => {
            const result = await deleteTask(taskId, redirectTo);

            if (result.success) {
                toast.success('Task deleted!', result.message);
                if (!redirectTo) {
                    router.refresh();
                }
            } else {
                toast.error('Failed to delete task', result.message);
            }
        });
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isPending}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-semibold disabled:opacity-50"
        >
            {isPending ? 'Deleting...' : 'Delete Task'}
        </button>
    );
}