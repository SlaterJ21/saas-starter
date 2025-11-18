'use client';

import { updateTaskStatus } from '@/app/actions/task';
import { useState } from 'react';

type Props = {
    taskId: string;
    currentStatus: string;
};

export default function TaskStatusButtons({ taskId, currentStatus }: Props) {
    const [isUpdating, setIsUpdating] = useState(false);

    const statuses = [
        { value: 'todo', label: 'To Do', color: 'bg-gray-500 hover:bg-gray-600' },
        { value: 'in_progress', label: 'In Progress', color: 'bg-blue-500 hover:bg-blue-600' },
        { value: 'done', label: 'Done', color: 'bg-green-500 hover:bg-green-600' },
    ];

    async function handleStatusChange(newStatus: string) {
        if (newStatus === currentStatus || isUpdating) return;

        setIsUpdating(true);
        try {
            await updateTaskStatus(taskId, newStatus);
        } catch (error) {
            console.error('Failed to update status:', error);
            alert('Failed to update task status');
        } finally {
            setIsUpdating(false);
        }
    }

    return (
        <div className="flex gap-2">
            {statuses.map((status) => (
                <button
                    key={status.value}
                    onClick={() => handleStatusChange(status.value)}
                    disabled={isUpdating || status.value === currentStatus}
                    className={`px-3 py-1 text-xs font-semibold text-white rounded transition ${
                        status.value === currentStatus
                            ? 'bg-gray-800 cursor-default'
                            : status.color
                    } disabled:opacity-50`}
                >
                    {status.value === currentStatus ? '✓ ' : ''}{status.label}
                </button>
            ))}
        </div>
    );
}