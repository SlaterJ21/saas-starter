'use client';

import {useState, useTransition} from 'react';
import {updateTask} from '@/app/actions/task';
import {toast} from '@/lib/toast';
import Link from 'next/link';

export function TaskEditForm({
                                 task,
                                 orgMembers,
                                 projectId
                             }: {
    task: any;
    orgMembers: any[];
    projectId: string;
}) {
    const [isPending, startTransition] = useTransition();
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description || '');
    const [status, setStatus] = useState(task.status);
    const [assignedTo, setAssignedTo] = useState(task.assigned_to || '');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
            const result = await updateTask(task.id, formData);

            if (result.success) {
                toast.success('Task updated!', result.message);
            } else {
                toast.error('Failed to update task', result.message);
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                    Task Title *
                </label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
            </div>

            <div>
                <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                </label>
                <textarea
                    id="description"
                    name="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="status" className="block text-sm font-semibold text-gray-700 mb-2">
                        Status *
                    </label>
                    <select
                        id="status"
                        name="status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        required
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    >
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="done">Done</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="assigned_to" className="block text-sm font-semibold text-gray-700 mb-2">
                        Assign To
                    </label>
                    <select
                        id="assigned_to"
                        name="assigned_to"
                        value={assignedTo}
                        onChange={(e) => setAssignedTo(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    >
                        <option value="">Unassigned</option>
                        {orgMembers.map((member: any) => (
                            <option key={member.id} value={member.id}>
                                {member.name} ({member.email})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex gap-3">
                    <button
                        type="submit"
                        disabled={isPending}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50"
                    >
                        {isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                    <Link
                        href={`/projects/${projectId}`}
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                    >
                        Cancel
                    </Link>
                </div>
            </div>
        </form>
    );
}