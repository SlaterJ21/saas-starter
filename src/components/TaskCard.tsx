'use client';

import { useState, useTransition } from 'react';
import { updateTaskStatus } from '@/app/actions/task';
import { toast } from '@/lib/toast';
import Link from 'next/link';

interface TaskCardProps {
    task: {
        id: string;
        title: string;
        description?: string;
        status: string;
        project_name: string;
        assigned_to_name?: string;
    };
}

export function TaskCard({ task }: TaskCardProps) {
    const [isPending, startTransition] = useTransition();
    const [optimisticStatus, setOptimisticStatus] = useState(task.status);

    const handleStatusChange = (newStatus: string) => {
        // Optimistic update
        setOptimisticStatus(newStatus);

        startTransition(async () => {
            const result = await updateTaskStatus(task.id, newStatus);

            if (!result.success) {
                // Revert on error
                setOptimisticStatus(task.status);
                toast.error('Failed to update task', result.message);
            }
        });
    };

    const statusColors = {
        todo: 'bg-gray-100 border-gray-300',
        in_progress: 'bg-blue-100 border-blue-300',
        done: 'bg-green-100 border-green-300',
    };

    return (
        <div className={`${statusColors[optimisticStatus as keyof typeof statusColors]} border-2 rounded-lg p-3 transition-colors ${isPending ? 'opacity-50' : ''}`}>
            <Link href={`/tasks/${task.id}`} className="block mb-2">
                <h4 className="font-semibold text-gray-900 text-sm mb-1 hover:text-blue-600 transition">
                    {task.title}
                </h4>
                {task.description && (
                    <p className="text-gray-600 text-xs mb-2">
                        {task.description}
                    </p>
                )}
            </Link>

            <div className="flex items-center justify-between gap-2 text-xs text-gray-600">
                <span className="font-medium">{task.project_name}</span>

                <select
                    value={optimisticStatus}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={isPending}
                    className="text-xs border border-gray-300 rounded px-1 py-0.5 bg-white disabled:opacity-50"
                    onClick={(e) => e.stopPropagation()}
                >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                </select>
            </div>

            {task.assigned_to_name && (
                <p className="text-xs text-gray-500 mt-2">→ {task.assigned_to_name}</p>
            )}
        </div>
    );
}