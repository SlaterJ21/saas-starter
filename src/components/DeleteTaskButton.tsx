'use client';

import { deleteTask } from '@/app/actions/task';
import { useState } from 'react';

type Props = {
    taskId: string;
    redirectTo: string;
};

export default function DeleteTaskButton({ taskId, redirectTo }: Props) {
    const [isDeleting, setIsDeleting] = useState(false);

    async function handleDelete() {
        if (!confirm('Are you sure you want to delete this task?')) {
            return;
        }

        setIsDeleting(true);
        try {
            await deleteTask(taskId, redirectTo);
        } catch (error) {
            console.error('Failed to delete task:', error);
            alert('Failed to delete task');
            setIsDeleting(false);
        }
    }

    return (
        <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold disabled:opacity-50"
        >
            {isDeleting ? 'Deleting...' : 'Delete Task'}
        </button>
    );
}